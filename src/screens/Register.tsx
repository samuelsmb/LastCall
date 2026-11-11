import { useEffect, useState, type ReactNode } from 'react'
import { categoryFromIndustry, cleanOrgNumber, isValidOrgNumber, lookupOrg, type OrgInfo } from '../domain/brreg'
import { CATEGORIES, CATEGORY_META, NEIGHBOURHOODS } from '../domain/categories'
import { calculateFee } from '../domain/pricing'
import { TEMPLATES } from '../domain/seed'
import { DEFAULT_RULE } from '../domain/selectors'
import { registerBusiness } from '../domain/store'
import type { Category, ReleaseMode, Slot } from '../domain/types'
import { go, kr } from '../lib'
import { Band, Button, CategoryBadge, Chip, DiscountSticker, Price, Segmented } from '../ui'

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

const inputClass = 'rounded border border-[#ddd] bg-canvas px-3 py-2.5 outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30'

export function Register() {
  const [step, setStep] = useState<'details' | 'pricing' | 'done'>('details')

  const [entry, setEntry] = useState<Entry>('lookup')
  const [orgInput, setOrgInput] = useState('')
  const [lookup, setLookup] = useState<Lookup>({ status: 'idle' })

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [place, setPlace] = useState('')
  const [tagline, setTagline] = useState('')
  const [category, setCategory] = useState<Category | null>(null)

  const [calendar, setCalendar] = useState<CalendarId | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [mode, setMode] = useState<ReleaseMode>('full')

  const found = entry === 'lookup' && lookup.status === 'found' ? lookup.org : null
  const detailsOpen = entry === 'manual' || !!found
  // Manual entry skips the lookup step, so the remaining steps count from 1.
  const stepOffset = entry === 'manual' ? 0 : 1
  const ready = !!name.trim() && !!place.trim() && !!category && !!calendar && !connecting
  const calendarLabel = CALENDARS.find((c) => c.id === calendar)?.label

  const runLookup = async () => {
    const orgnr = cleanOrgNumber(orgInput)
    if (!isValidOrgNumber(orgnr)) return setLookup({ status: 'invalid' })
    setLookup({ status: 'loading' })
    try {
      const org = await lookupOrg(orgnr)
      if (!org) return setLookup({ status: 'notfound' })
      setLookup({ status: 'found', org })
      setName(org.name)
      setAddress(org.address)
      setPlace(org.place)
      setTagline(org.industry ?? '')
      setCategory(categoryFromIndustry(org.industryCode))
    } catch {
      setLookup({ status: 'error' })
    }
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
            <Example label="Dekkskift, 550 kr" fee={calculateFee({ fullPrice: 550 }, NO_INTRO).fee} />
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
        <p className="mt-4 text-lg text-muted">Skriv inn organisasjonsnummeret, så fyller vi ut resten. Du er live på under ett minutt.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-8 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[15px] text-muted">{entry === 'lookup' ? 'Vi henter detaljene fra Brønnøysundregistrene.' : 'Har du ikke org.nr.? Fyll inn selv.'}</span>
            <Segmented
              value={entry}
              options={[
                { value: 'lookup', label: 'Org.nr.' },
                { value: 'manual', label: 'Manuelt' },
              ]}
              onChange={(v) => v && setEntry(v)}
            />
          </div>

          {entry === 'lookup' && (
            <Step n={1} title="Finn bedriften din">
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  runLookup()
                }}
              >
                <input
                  value={orgInput}
                  onChange={(e) => setOrgInput(e.target.value)}
                  inputMode="numeric"
                  placeholder="Org.nr., f.eks. 915 615 767"
                  aria-label="Organisasjonsnummer"
                  className={`${inputClass} flex-1 tabular-nums`}
                />
                <Button type="submit" variant="utility" disabled={!orgInput.trim() || lookup.status === 'loading'}>
                  {lookup.status === 'loading' ? 'Søker…' : 'Søk'}
                </Button>
              </form>
              <LookupMessage lookup={lookup} />
              {found && (
                <div className="flex items-start justify-between gap-3 rounded-lg bg-paper p-4 text-[15px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{found.name}</span>
                    <span className="text-muted">{[found.address, `${found.postcode} ${found.place}`.trim()].filter(Boolean).join(', ')}</span>
                    {found.industry && <span className="text-muted">{found.industry}</span>}
                    <span className="text-sm text-faint">Org.nr. {found.orgNumber} · Brønnøysundregistrene</span>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-green">✓ Funnet</span>
                </div>
              )}
            </Step>
          )}

          {detailsOpen && (
            <Step n={stepOffset + 1} title={found ? 'Sjekk detaljene' : 'Detaljene dine'}>
              <Field label="Bedriftsnavn">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="f.eks. Dekkproff Bjerke eller Theatercaféen" className={inputClass} />
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
          <PreviewCard name={name} place={place} category={category} mode={mode} />
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

function LookupMessage({ lookup }: { lookup: Lookup }) {
  const messages: Partial<Record<Lookup['status'], string>> = {
    invalid: 'Det ser ikke ut som et gyldig org.nr. Det har 9 sifre.',
    notfound: 'Vi fant ikke det org.nr. i Brønnøysundregistrene.',
    error: 'Vi fikk ikke kontakt med Brønnøysundregistrene. Prøv igjen, eller fyll inn manuelt.',
  }
  const msg = messages[lookup.status]
  return msg ? <p className="text-[15px] text-orange">{msg}</p> : null
}

/** How the Business's Last Calls will look to Customers, using its first calendar template. */
function PreviewCard({ name, place, category, mode }: { name: string; place: string; category: Category | null; mode: ReleaseMode }) {
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
        <Band category={cat} className="h-24">
          <DiscountSticker slot={slot} className="absolute right-3 top-3" />
        </Band>
        <div className="flex flex-col gap-1.5 px-5 pb-5 pt-10">
          <CategoryBadge category={cat} />
          <h3 className="heading-3 mt-1.5">{title}</h3>
          <p className="text-[15px] text-muted">
            {name.trim() || 'Bedriften din'} · {place.trim() || 'Stedet ditt'}
          </p>
          <div className="mt-2 border-t border-hairline pt-3">
            <Price slot={slot} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Calculator() {
  const [perWeek, setPerWeek] = useState(5)
  const [avg, setAvg] = useState(550)
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
        <Chip active={perWeek === 5 && avg === 550} onClick={() => { setPerWeek(5); setAvg(550) }}>
          🚗 Dekkskift, 550 kr
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
