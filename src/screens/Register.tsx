import { useState } from 'react'
import { CATEGORIES, CATEGORY_META, NEIGHBOURHOODS } from '../domain/categories'
import { calculateFee } from '../domain/pricing'
import { registerBusiness } from '../domain/store'
import type { Category, ReleaseMode } from '../domain/types'
import { go, kr } from '../lib'
import { Button, Chip, Segmented } from '../ui'

export const WAITLIST_LINE = 'Har du allerede en venteliste? Flott. LastCall trår først inn når ventelisten din ikke klarer å fylle timen.'

const WEEKS_PER_MONTH = 4.3
const NO_INTRO = { introSpotsLeft: 0 }

const FAQ: [string, string][] = [
  ['Hva om kunden ikke møter opp?', 'Da betaler du ingenting. Vi tar bare betalt for fylte plasser der kunden faktisk dukker opp.'],
  ['Må jeg gi rabatt?', 'Nei. Du bestemmer prisen. Full pris fungerer fint: kundene får hoppe over køen.'],
  ['Kan jeg slutte?', 'Når som helst, gratis. Ingen binding.'],
]

export function Register() {
  const [step, setStep] = useState<'details' | 'pricing' | 'done'>('details')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [neighbourhood, setNeighbourhood] = useState(NEIGHBOURHOODS[0])
  const [mode, setMode] = useState<ReleaseMode>('full')

  const goLive = () => {
    if (!name.trim() || !category) return
    registerBusiness(name.trim(), category, neighbourhood, mode)
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-14 text-center">
        <span className="grid h-16 w-16 animate-rise place-items-center rounded-full bg-green text-3xl text-white">✓</span>
        <h1 className="display-2">Du er live på LastCall</h1>
        <p className="text-lg text-muted">Vi har synkronisert kalenderen din. Neste gang noen avbestiller hos {name}, kan den ledige timen fylles med ett klikk. De første 10 fylte plassene er gratis.</p>
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
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <a href="#/biz" className="self-start rounded-md px-2 py-1 text-[15px] text-muted hover:bg-black/5 hover:text-ink">
        ← Tilbake til oversikten
      </a>
      <div className="-mt-4 text-center">
        <span className="eyebrow inline-block rounded-full bg-canvas px-2.5 py-1 text-primary shadow-soft">For bedrifter · Steg 1 av 2</span>
        <h1 className="display-2 mt-4">Gjør avbestillinger om til inntekt</h1>
        <p className="mt-4 text-lg text-muted">Bli med i LastCall på 30 sekunder. Vi tar det derfra.</p>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft sm:p-8">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Bedriftsnavn</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="f.eks. Ted's Garage eller Theatercaféen"
            className="rounded border border-[#ddd] bg-canvas px-3 py-2.5 outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="eyebrow text-muted">Hva tilbyr du?</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                <span>{CATEGORY_META[c].icon}</span> {CATEGORY_META[c].label}
              </Chip>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Bydel</span>
          <select value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)} className="cursor-pointer rounded border border-[#ddd] bg-canvas px-3 py-2.5 outline-none">
            {NEIGHBOURHOODS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>

        <Button size="lg" onClick={() => setStep('pricing')} disabled={!name.trim() || !category}>
          Neste: pris
        </Button>
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
