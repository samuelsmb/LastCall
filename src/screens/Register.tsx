import { useState } from 'react'
import { CATEGORIES, CATEGORY_META, NEIGHBOURHOODS } from '../domain/categories'
import { calculateFee } from '../domain/pricing'
import { registerBusiness } from '../domain/store'
import type { Category, ReleaseMode } from '../domain/types'
import { go, kr } from '../lib'
import { Button, Chip, Segmented } from '../ui'

export const WAITLIST_LINE = 'Already have a waitlist? Great. LastCall kicks in only when your waitlist can’t fill the slot.'

const WEEKS_PER_MONTH = 4.3
const NO_INTRO = { introSpotsLeft: 0 }

const FAQ: [string, string][] = [
  ['What if the customer doesn’t show up?', 'You pay nothing. We only charge for filled spots where the customer turns up.'],
  ['Do I have to give a discount?', 'No. You set the price. Full price works: customers get to skip the queue.'],
  ['Can I stop?', 'Anytime, for free. No lock-in.'],
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
        <h1 className="display-2">You're live on LastCall</h1>
        <p className="text-lg text-muted">We've synced your calendar. Next time someone cancels on {name}, that empty slot can be filled in one click. Your first 10 filled spots are on us.</p>
        <Button size="lg" onClick={() => go('/biz')}>
          Go to your dashboard
        </Button>
      </div>
    )
  }

  if (step === 'pricing') {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div className="text-center">
          <span className="eyebrow inline-block rounded-full bg-canvas px-2.5 py-1 text-primary shadow-soft">Step 2 of 2 · Pricing</span>
          <h1 className="display-2 mt-4">You only pay when we fill an empty slot.</h1>
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft sm:p-8">
          <ul className="flex flex-col gap-2 text-[17px]">
            {['0 kr to join, no monthly fee', '49 kr per filled spot, never more than 10%', 'Your first 10 are on us'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green text-sm text-white">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">A spot is one appointment, or one guest at a restaurant. Only charged if the customer shows up. Invoiced monthly.</p>

          <Calculator />

          <div className="grid gap-2 sm:grid-cols-2">
            <Example label="Tyre change, 550 kr" fee={calculateFee({ fullPrice: 550 }, NO_INTRO).fee} />
            <Example label="Table for 2, 4,000 kr" fee={calculateFee({ fullPrice: 4000, guests: 2 }, NO_INTRO).fee} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="eyebrow text-muted">Default release mode</span>
            <Segmented
              value={mode}
              onChange={(m) => m && setMode(m)}
              options={[
                { value: 'full', label: 'Full price (Skip the queue)' },
                { value: 'discount', label: 'Discount' },
              ]}
            />
            <p className="text-sm text-muted">{mode === 'full' ? 'Cancelled slots go live at once at your normal price.' : 'Cancelled slots are held for full-price customers, then released at a discount before they start.'} You can change this anytime.</p>
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
              Back
            </Button>
            <Button size="lg" className="flex-1" onClick={goLive}>
              Go live
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <a href="#/biz" className="self-start rounded-md px-2 py-1 text-[15px] text-muted hover:bg-black/5 hover:text-ink">
        ← Back to dashboard
      </a>
      <div className="-mt-4 text-center">
        <span className="eyebrow inline-block rounded-full bg-canvas px-2.5 py-1 text-primary shadow-soft">For businesses · Step 1 of 2</span>
        <h1 className="display-2 mt-4">Turn cancellations into revenue</h1>
        <p className="mt-4 text-lg text-muted">Join LastCall in 30 seconds. We'll take it from there.</p>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft sm:p-8">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Business name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Brenda's Hair Studio"
            className="rounded border border-[#ddd] bg-canvas px-3 py-2.5 outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="eyebrow text-muted">What do you offer?</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                <span>{CATEGORY_META[c].icon}</span> {CATEGORY_META[c].label}
              </Chip>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Neighbourhood</span>
          <select value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)} className="cursor-pointer rounded border border-[#ddd] bg-canvas px-3 py-2.5 outline-none">
            {NEIGHBOURHOODS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>

        <Button size="lg" onClick={() => setStep('pricing')} disabled={!name.trim() || !category}>
          Next: pricing
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
          <span className="eyebrow text-muted">Cancellations per week</span>
          <input type="number" min={0} value={perWeek} onChange={(e) => setPerWeek(Math.max(0, Number(e.target.value)))} className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Average price (kr)</span>
          <input type="number" min={0} step={50} value={avg} onChange={(e) => setAvg(Math.max(0, Number(e.target.value)))} className={field} />
        </label>
      </div>
      <p className="text-[15px] text-ink-2">
        You could recover up to <b className="font-semibold text-ink">{kr(recover)}/month</b>. LastCall costs you max <b className="font-semibold text-ink">{kr(cost)}</b>, only for slots we fill.
      </p>
    </div>
  )
}

function Example({ label, fee }: { label: string; fee: number }) {
  return (
    <div className="rounded-lg border border-hairline p-3 text-[15px]">
      {label} → you pay <b className="font-semibold">{kr(fee)}</b>
    </div>
  )
}
