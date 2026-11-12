import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { categoryFromIndustry, cleanOrgNumber, formatOrgNumber, isValidOrgNumber, listUnits, lookupOrg, searchOrgs, type OrgHit, type OrgInfo, type OrgStatus, type OrgUnit } from '../domain/brreg'
import { CITY } from '../brand'
import { CATEGORIES, CATEGORY_META, NEIGHBOURHOODS, neighbourhoodFromPostcode } from '../domain/categories'
import { calculateFee } from '../domain/pricing'
import { TEMPLATES } from '../domain/seed'
import { DEFAULT_RULE } from '../domain/selectors'
import { fetchSiteImage } from '../domain/siteImage'
import { registerBusiness, useAppState } from '../domain/store'
import type { Category, ReleaseMode, Slot } from '../domain/types'
import { go, kr } from '../lib'
import { Band, Button, CategoryBadge, Chip, DiscountSticker, Price, Segmented, SiteImage } from '../ui'

export const WAITLIST_LINE = 'Har du allerede en venteliste? Flott. LastCall trår først inn når ventelisten din ikke klarer å fylle timen.'

const WEEKS_PER_MONTH = 4.3
const NO_INTRO = { introSpotsLeft: 0 }

const FAQ: [string, string][] = [
  ['Hva om kunden ikke møter opp?', 'Da betaler du ingenting. Vi tar bare betalt for fylte plasser der kunden faktisk dukker opp.'],
  ['Må jeg gi rabatt?', 'Nei. Du bestemmer prisen. Full pris fungerer fint: kundene får hoppe over køen.'],
  ['Kan jeg slutte?', 'Når som helst, gratis. Ingen binding.'],
]

const CALENDARS = [
  { id: 'google', label: 'Google Kalender', icon: '📅' },
  { id: 'outlook', label: 'Outlook', icon: '📨' },
  { id: 'booking', label: 'Bookingsystem', icon: '🗂️' },
  { id: 'manual', label: 'Manuelt, jeg legger inn timer', icon: '✍️' },
] as const

type CalendarId = (typeof CALENDARS)[number]['id']
type Entry = 'lookup' | 'manual'
type Lookup = { status: 'idle' | 'loading' | 'notfound' | 'invalid' | 'error' } | { status: 'found'; org: OrgInfo }

/** A real Oslo restaurant with a website, so a demo runs the whole lookup in one click. */
const DEMO_ORG = '954080072'

const inputClass = 'rounded border border-[#ddd] bg-canvas px-3 py-2.5 outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30'

const STATUS_NOTICE: Record<Exclude<OrgStatus, 'ok'>, string> = {
  bankrupt: 'Bedriften er registrert som konkurs i Brønnøysundregistrene, så den kan ikke registreres på LastCall.',
  'winding-up': 'Bedriften er under avvikling i Brønnøysundregistrene, så den kan ikke registreres på LastCall.',
  deleted: 'Bedriften er slettet fra Brønnøysundregistrene, så den kan ikke registreres på LastCall.',
}

/** Addresses in our city get a neighbourhood from the postcode; elsewhere we keep the post town. */
function placeOf(a: { postcode: string; place: string; kommune: string }) {
  return (a.kommune === CITY && neighbourhoodFromPostcode(a.postcode)) || a.place
}

export function Register() {
  const state = useAppState()
  const [step, setStep] = useState<'details' | 'pricing' | 'done'>('details')

  const [entry, setEntry] = useState<Entry>('lookup')
  const [lookup, setLookup] = useState<Lookup>({ status: 'idle' })
  const [units, setUnits] = useState<OrgUnit[]>([])
  const [unitId, setUnitId] = useState<string | null>(null)
  const lookupCtrl = useRef<AbortController | null>(null)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [place, setPlace] = useState('')
  const [tagline, setTagline] = useState('')
  const [category, setCategory] = useState<Category | null>(null)

  const [calendar, setCalendar] = useState<CalendarId | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [mode, setMode] = useState<ReleaseMode>('full')

  const found = entry === 'lookup' && lookup.status === 'found' ? lookup.org : null
  const existing = found ? state.businesses.find((b) => b.orgNumber === found.orgNumber) : undefined
  const blocked = !!found && (found.status !== 'ok' || !!existing)
  const needsUnit = !!found && units.length > 1 && !unitId
  const detailsOpen = entry === 'manual' || (!!found && !blocked)
  // Manual entry skips the lookup step, so the remaining steps count from 1.
  const stepOffset = entry === 'manual' ? 0 : 1
  const ready = !!name.trim() && !!place.trim() && !!category && !!calendar && !connecting && !(entry === 'lookup' && (blocked || needsUnit))
  const calendarLabel = CALENDARS.find((c) => c.id === calendar)?.label

  const [site, setSite] = useState('')
  const [image, setImage] = useState('')
  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'none' | 'error'>('idle')

  const fetchImage = async (from = site) => {
    if (!from.trim()) return
    setImageStatus('loading')
    try {
      const url = await fetchSiteImage(from)
      setImage(url ?? '')
      setImageStatus(url ? 'idle' : 'none')
    } catch {
      setImageStatus('error')
    }
  }

  const clearLookup = () => {
    lookupCtrl.current?.abort()
    setLookup({ status: 'idle' })
    setUnits([])
    setUnitId(null)
  }

  const selectOrg = async (orgnr: string) => {
    clearLookup()
    if (!isValidOrgNumber(orgnr)) return setLookup({ status: 'invalid' })
    const ctrl = new AbortController()
    lookupCtrl.current = ctrl
    setLookup({ status: 'loading' })
    try {
      const org = await lookupOrg(orgnr, ctrl.signal)
      if (!org) return setLookup({ status: 'notfound' })
      setLookup({ status: 'found', org })
      setName(org.name)
      setAddress(org.address)
      setPlace(placeOf(org))
      setTagline(org.industry ?? '')
      // The register often knows the website; fill it in and fetch its picture straight away.
      setSite(org.website ?? '')
      setImage('')
      setImageStatus('idle')
      if (org.website) fetchImage(org.website)
      setCategory(categoryFromIndustry(org.industryCode))
      const locations = await listUnits(orgnr, ctrl.signal).catch(() => [])
      setUnits(locations)
      if (locations.length === 1) chooseUnit(locations[0])
    } catch {
      if (!ctrl.signal.aborted) setLookup({ status: 'error' })
    }
  }

  const chooseUnit = (u: OrgUnit) => {
    setUnitId(u.orgNumber)
    setAddress(u.address)
    setPlace(placeOf(u))
  }

  const chooseCalendar = (id: CalendarId) => {
    setCalendar(id)
    setConnecting(id !== 'manual')
  }

  useEffect(() => {
    if (!connecting) return
    const t = setTimeout(() => setConnecting(false), 1100)
    return () => clearTimeout(t)
  }, [connecting])

  const goLive = () => {
    if (!ready) return
    registerBusiness({
      name: name.trim(),
      category,
      neighbourhood: place.trim(),
      address: address.trim() || place.trim(),
      tagline: tagline.trim() || 'Ny på LastCall',
      orgNumber: found?.orgNumber,
      calendar: calendarLabel,
      image: image || undefined,
      website: site.trim().replace(/^https?:\/\//i, '') || undefined,
      mode,
    })
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-14 text-center">
        <span className="grid h-16 w-16 animate-rise place-items-center rounded-full bg-green text-3xl text-white">✓</span>
        <h1 className="display-2">Du er live på LastCall</h1>
        <p className="text-lg text-muted">
          {calendar === 'manual' ? 'Legg inn timene dine, så følger vi med på avbestillinger.' : `Vi har synkronisert ${calendarLabel}.`} Neste gang noen avbestiller hos {name}, kan den ledige timen fylles med ett klikk. De første 10 fylte plassene er gratis.
        </p>
        <Button size="lg" onClick={() => go('/biz')}>
          Gå til oversikten din
        </Button>
      </div>
    )
  }

  if (step === 'pricing') {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div className="text-center">
          <span className="eyebrow inline-block rounded-full bg-canvas px-2.5 py-1 text-primary shadow-soft">Steg 2 av 2 · Pris</span>
          <h1 className="display-2 mt-4">Du betaler bare når vi fyller en ledig time.</h1>
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft sm:p-8">
          <ul className="flex flex-col gap-2 text-[17px]">
            {['0 kr for å bli med, ingen månedsavgift', '49 kr per fylte plass, aldri mer enn 10 %', 'De første 10 er gratis'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green text-sm text-white">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">En plass er én time, eller én gjest på en restaurant. Vi tar kun betalt hvis kunden møter opp. Faktureres månedlig.</p>

          <Calculator />

          <div className="grid gap-2 sm:grid-cols-2">
            <Example label="Dekkskift, 900 kr" fee={calculateFee({ fullPrice: 900 }, NO_INTRO).fee} />
            <Example label="Bord for 2, 4 000 kr" fee={calculateFee({ fullPrice: 4000, guests: 2 }, NO_INTRO).fee} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow text-muted">Standard frigivelsesmodus</span>
            <Segmented
              value={mode}
              onChange={(m) => m && setMode(m)}
              options={[
                { value: 'full', label: 'Full pris (Hopp over køen)' },
                { value: 'discount', label: 'Rabatt' },
              ]}
            />
            <p className="text-sm text-muted">{mode === 'full' ? 'Avbestilte timer legges ut med en gang til vanlig pris.' : 'Avbestilte timer holdes tilbake for kunder som betaler full pris, og frigis så med rabatt før de starter.'} Du kan endre dette når som helst.</p>
            <p className="text-sm text-muted">
              🎁 Kunden som avbestiller får {DEFAULT_RULE.cancellerBonusPct} % av salgsprisen tilbake hvis timen blir solgt videre, så flere sier ifra i stedet for å bare ikke møte opp. Du velger prosenten, eller slår det av, i oversikten.
            </p>
          </div>

          <p className="rounded-lg bg-paper p-3 text-[15px] text-ink-2">{WAITLIST_LINE}</p>

          <dl className="flex flex-col gap-3">
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <dt className="font-medium">{q}</dt>
                <dd className="text-[15px] text-muted">{a}</dd>
              </div>
            ))}
          </dl>

          <div className="flex gap-2">
            <Button variant="utility" onClick={() => setStep('details')}>
              Tilbake
            </Button>
            <Button size="lg" className="flex-1" onClick={goLive}>
              Gå live
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <a href="#/biz" className="self-start rounded-md px-2 py-1 text-[15px] text-muted hover:bg-black/5 hover:text-ink">
        ← Tilbake til oversikten
      </a>
      <div className="mx-auto -mt-4 max-w-2xl text-center">
        <span className="eyebrow inline-block rounded-full bg-canvas px-2.5 py-1 text-primary shadow-soft">For bedrifter · Steg 1 av 2</span>
        <h1 className="display-2 mt-4">Gjør avbestillinger om til inntekt</h1>
        <p className="mt-4 text-lg text-muted">Søk opp bedriften din, så fyller vi ut resten. Du er live på under ett minutt.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-8 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px] text-muted">{entry === 'lookup' ? 'Vi henter detaljene fra Brønnøysundregistrene.' : 'Finner du ikke bedriften? Fyll inn selv.'}</span>
            <Segmented
              value={entry}
              options={[
                { value: 'lookup', label: 'Søk' },
                { value: 'manual', label: 'Manuelt' },
              ]}
              onChange={(v) => v && setEntry(v)}
            />
          </div>

          {entry === 'lookup' && (
            <Step n={1} title="Finn bedriften din">
              <OrgSearch onPick={selectOrg} onClear={clearLookup} loading={lookup.status === 'loading'} />
              <LookupMessage lookup={lookup} />
              {found && (
                <div className="flex items-start justify-between gap-3 rounded-lg bg-paper p-4 text-[15px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{found.name}</span>
                    <span className="text-muted">{[found.address, `${found.postcode} ${found.place}`.trim()].filter(Boolean).join(', ')}</span>
                    {found.industry && <span className="text-muted">{found.industry}</span>}
                    <span className="text-sm text-faint">Org.nr. {formatOrgNumber(found.orgNumber)} · Brønnøysundregistrene</span>
                  </div>
                  {!blocked && <span className="shrink-0 text-sm font-medium text-green">✓ Funnet</span>}
                </div>
              )}
              {found && found.status !== 'ok' && <p className="rounded-lg bg-orange/10 p-4 text-[15px] text-orange-deep">{STATUS_NOTICE[found.status]}</p>}
              {found && found.status === 'ok' && existing && (
                <p className="rounded-lg bg-orange/10 p-4 text-[15px] text-orange-deep">
                  {existing.name} er allerede registrert på LastCall.{' '}
                  <a href={`#/biz/${existing.id}`} className="font-medium underline">
                    Gå til oversikten
                  </a>
                </p>
              )}
              {found && !blocked && units.length > 1 && (
                <div className="flex flex-col gap-2">
                  <span className="eyebrow text-muted">
                    Hvilken avdeling vil du registrere? <span className="ml-1 normal-case text-faint">{units.length} avdelinger</span>
                  </span>
                  <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
                    {units.map((u) => {
                      const active = unitId === u.orgNumber
                      return (
                        <button
                          key={u.orgNumber}
                          type="button"
                          onClick={() => chooseUnit(u)}
                          className={`flex cursor-pointer flex-col rounded-lg border px-4 py-3 text-left text-[15px] transition ${active ? 'border-ink bg-paper' : 'border-hairline hover:bg-paper'}`}
                        >
                          <span className="font-medium">
                            {u.name}
                            {active && <span className="ml-2 text-green">✓</span>}
                          </span>
                          <span className="text-muted">{[u.address, `${u.postcode} ${u.place}`.trim()].filter(Boolean).join(', ')}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </Step>
          )}

          {detailsOpen && (
            <Step n={stepOffset + 1} title={found ? 'Sjekk detaljene' : 'Detaljene dine'}>
              <Field label="Bedriftsnavn">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="f.eks. Mekonomen eller Theatercaféen" className={inputClass} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Adresse">
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Gate og nummer" className={inputClass} />
                </Field>
                <Field label="Sted">
                  <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="f.eks. Grünerløkka" list="register-places" className={inputClass} />
                  <datalist id="register-places">
                    {NEIGHBOURHOODS.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                </Field>
              </div>
              {/* A looked-up business only shows its website once the register's site gave us a picture; manual entry can fetch one itself. */}
              {(entry === 'manual' || image) && (
                <Field label="Nettside (valgfritt)">
                  <div className="flex gap-2">
                    <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="f.eks. theatercafeen.no" className={`${inputClass} flex-1`} />
                    {!image && (
                      <Button variant="secondary" onClick={() => fetchImage()} disabled={!site.trim() || imageStatus === 'loading'}>
                        {imageStatus === 'loading' ? 'Henter…' : 'Hent bilde'}
                      </Button>
                    )}
                  </div>
                  {imageStatus === 'none' && <span className="text-sm text-muted">Fant ikke noe bilde på nettsiden.</span>}
                  {imageStatus === 'error' && <span className="text-sm text-muted">Kunne ikke hente bilde akkurat nå.</span>}
                  {image && (
                    <div className="mt-1 h-24 w-full overflow-hidden rounded-lg bg-paper">
                      <SiteImage src={image} />
                    </div>
                  )}
                </Field>
              )}
              <div className="flex flex-col gap-2">
                <span className="eyebrow text-muted">
                  Hva tilbyr du?{found && category && <span className="ml-2 normal-case text-faint">foreslått ut fra næringskoden</span>}
                </span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                      <span>{CATEGORY_META[c].icon}</span> {CATEGORY_META[c].label}
                    </Chip>
                  ))}
                </div>
              </div>
            </Step>
          )}

          {detailsOpen && (
            <Step n={stepOffset + 2} title="Koble til kalenderen" hint="Så ser vi avbestillinger i det øyeblikket de skjer.">
              <div className="grid gap-2 sm:grid-cols-2">
                {CALENDARS.map((c) => {
                  const active = calendar === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => chooseCalendar(c.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left text-[15px] font-medium transition ${active ? 'border-ink bg-paper' : 'border-hairline hover:bg-paper'}`}
                    >
                      <span className="text-lg">{c.icon}</span>
                      <span className="flex-1">{c.label}</span>
                      {active && <span className={`text-sm ${connecting ? 'text-muted' : 'text-green'}`}>{connecting ? 'Kobler til…' : c.id === 'manual' ? '✓' : '✓ Koblet til'}</span>}
                    </button>
                  )
                })}
              </div>
            </Step>
          )}

          <Button size="lg" onClick={() => setStep('pricing')} disabled={!ready}>
            Neste: pris
          </Button>
        </div>

        <aside className="lg:sticky lg:top-24">
          <PreviewCard name={name} place={place} category={category} mode={mode} image={image} />
        </aside>
      </div>
    </div>
  )
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex animate-rise flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white">{n}</span>
        <div>
          <h2 className="title">{title}</h2>
          {hint && <p className="text-[15px] text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow text-muted">{label}</span>
      {children}
    </label>
  )
}

/**
 * One field for both org numbers and names. Digits are grouped as you type and looked up at 9;
 * text searches Brønnøysundregistrene by name after a short pause.
 */
function OrgSearch({ onPick, onClear, loading }: { onPick: (orgnr: string) => void; onClear: () => void; loading: boolean }) {
  const [text, setText] = useState('')
  const [hits, setHits] = useState<OrgHit[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [searching, setSearching] = useState(false)
  // Picking a hit puts its name in the field; that name shouldn't search again and reopen the list.
  const picked = useRef('')

  const digits = cleanOrgNumber(text)
  const isNumber = /^\d+$/.test(digits)
  const query = isNumber ? '' : text.trim()

  useEffect(() => {
    if (picked.current && query === picked.current) return
    if (query.length < 2) {
      setHits([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const found = await searchOrgs(query, ctrl.signal)
        setHits(found)
        setActive(0)
        setOpen(true)
      } catch {
        if (!ctrl.signal.aborted) setHits([])
      } finally {
        if (!ctrl.signal.aborted) setSearching(false)
      }
    }, 300)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [query])

  const change = (value: string) => {
    const d = cleanOrgNumber(value)
    if (/^\d+$/.test(d)) {
      const nine = d.slice(0, 9)
      setText(formatOrgNumber(nine))
      setOpen(false)
      if (nine.length === 9) onPick(nine)
      else onClear()
      return
    }
    setText(value)
    onClear()
  }

  const pick = (hit: OrgHit) => {
    picked.current = hit.name.trim()
    setText(hit.name)
    setOpen(false)
    onPick(hit.orgNumber)
  }

  const onKey = (e: KeyboardEvent) => {
    if (!open || !hits.length) return
    if (e.key === 'ArrowDown') setActive((i) => (i + 1) % hits.length)
    else if (e.key === 'ArrowUp') setActive((i) => (i - 1 + hits.length) % hits.length)
    else if (e.key === 'Enter') pick(hits[active])
    else if (e.key === 'Escape') setOpen(false)
    else return
    e.preventDefault()
  }

  const busy = loading || searching
  return (
    <div className="relative">
      <input
        value={text}
        onChange={(e) => change(e.target.value)}
        onKeyDown={onKey}
        onFocus={() => hits.length && setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Bedriftsnavn eller org.nr."
        aria-label="Bedriftsnavn eller organisasjonsnummer"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        className={`${inputClass} w-full ${text ? 'pr-20' : 'pr-44'} ${isNumber ? 'tabular-nums' : ''}`}
      />
      {!text && !busy && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => change(DEMO_ORG)}
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-paper px-2.5 py-1 text-sm text-muted transition hover:bg-black/5 hover:text-ink"
        >
          Tips: prøv <span className="tabular-nums">{formatOrgNumber(DEMO_ORG)}</span>
        </button>
      )}
      {busy && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">Søker…</span>}
      {open && (
        <ul role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-hairline bg-canvas shadow-soft">
          {hits.length === 0 && <li className="px-4 py-3 text-[15px] text-muted">Ingen treff. Prøv org.nr., eller fyll inn manuelt.</li>}
          {hits.map((h, i) => (
            <li
              key={h.orgNumber}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(h)
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer flex-col px-4 py-2.5 text-[15px] ${i === active ? 'bg-paper' : ''}`}
            >
              <span className="font-medium">{h.name}</span>
              <span className="text-sm text-muted">{[h.place, h.industry, formatOrgNumber(h.orgNumber)].filter(Boolean).join(' · ')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LookupMessage({ lookup }: { lookup: Lookup }) {
  const messages: Partial<Record<Lookup['status'], string>> = {
    invalid: 'Det org.nr. er ikke gyldig. Sjekk at sifrene stemmer.',
    notfound: 'Vi fant ikke det org.nr. i Brønnøysundregistrene.',
    error: 'Vi fikk ikke kontakt med Brønnøysundregistrene. Prøv igjen, eller fyll inn manuelt.',
  }
  const msg = messages[lookup.status]
  return msg ? <p className="text-[15px] text-orange">{msg}</p> : null
}

/** How the Business's Last Calls will look to Customers, using its first calendar template. */
function PreviewCard({ name, place, category, mode, image }: { name: string; place: string; category: Category | null; mode: ReleaseMode; image: string }) {
  const cat = category ?? 'experiences'
  const [title, fullPrice, guests] = TEMPLATES[cat][0]
  const slot: Slot = {
    id: 'preview',
    businessId: 'preview',
    title,
    description: '',
    start: 0,
    durationMin: 0,
    fullPrice,
    guests,
    status: 'released',
    discountPct: mode === 'discount' ? DEFAULT_RULE.discountPct : 0,
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow text-muted">Slik ser kundene deg</span>
      <div className={`flex flex-col overflow-hidden rounded-xl border border-hairline bg-canvas transition ${category ? '' : 'opacity-60 grayscale'}`}>
        <Band category={cat} image={image || undefined} className="h-24">
          <DiscountSticker slot={slot} className="absolute right-3 top-3" />
        </Band>
        <div className="flex flex-col gap-1.5 px-5 pb-5 pt-10">
          <CategoryBadge category={cat} />
          <h3 className="heading-3 mt-1.5">{title}</h3>
          <p className="text-[15px] text-muted">
            {name.trim() || 'Bedriften din'} · {place.trim() || 'Stedet ditt'}
          </p>
          <div className="mt-2 border-t border-hairline pt-3">
            <Price slot={slot} from={cat === 'car'} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Calculator() {
  const [perWeek, setPerWeek] = useState(5)
  const [avg, setAvg] = useState(900)
  const spots = perWeek * WEEKS_PER_MONTH
  const recover = Math.round(spots * avg)
  const cost = Math.round(spots * calculateFee({ fullPrice: avg }, NO_INTRO).fee)
  const field = 'w-full rounded border border-[#ddd] bg-canvas px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30'
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-paper p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Avbestillinger per uke</span>
          <input type="number" min={0} value={perWeek} onChange={(e) => setPerWeek(Math.max(0, Number(e.target.value)))} className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Gjennomsnittspris (kr)</span>
          <input type="number" min={0} step={50} value={avg} onChange={(e) => setAvg(Math.max(0, Number(e.target.value)))} className={field} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[15px] text-muted">
        Eksempel:
        <Chip active={perWeek === 5 && avg === 900} onClick={() => { setPerWeek(5); setAvg(900) }}>
          🚗 Dekkskift, 900 kr
        </Chip>
        <Chip active={perWeek === 3 && avg === 4000} onClick={() => { setPerWeek(3); setAvg(4000) }}>
          🍽️ Bord for 2, 4 000 kr
        </Chip>
      </div>
      <p className="text-[15px] text-ink-2">
        Du kan berge opptil <b className="font-semibold text-ink">{kr(recover)}/måned</b>. LastCall koster deg maks <b className="font-semibold text-ink">{kr(cost)}</b>, kun for timer vi fyller.
      </p>
    </div>
  )
}

function Example({ label, fee }: { label: string; fee: number }) {
  return (
    <div className="rounded-lg border border-hairline p-3 text-[15px]">
      {label} → du betaler <b className="font-semibold">{kr(fee)}</b>
    </div>
  )
}
