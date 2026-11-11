import { CATEGORY_META } from '../domain/categories'
import { businessOf, lastCallPrice, savings } from '../domain/selectors'
import { useAppState } from '../domain/store'
import { clock, dayLabel, go, kr, useNow, when } from '../lib'
import { Button } from '../ui'
import { Gone } from './LastCallDetail'

export function Booked({ id }: { id: string }) {
  const state = useAppState()
  const now = useNow()
  const slot = state.slots.find((s) => s.id === id)
  if (!slot || slot.status !== 'sold') return <Gone title="We couldn't find this booking" />
  const biz = businessOf(state, slot)
  const first = slot.buyerName && slot.buyerName !== 'Guest' ? `, ${slot.buyerName.split(' ')[0]}` : ''
  const day = dayLabel(slot.start, now)
  const seeYou = day === 'Today' ? `today at ${clock(slot.start)}` : `${day === 'Tomorrow' ? 'tomorrow' : day} at ${clock(slot.start)}`

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-8 text-center">
      <span className="grid h-16 w-16 animate-rise place-items-center rounded-full bg-green text-3xl text-white">✓</span>
      <div>
        <h1 className="display-2">It's yours{first}.</h1>
        <p className="mt-3 text-lg text-muted">See you {seeYou}.</p>
      </div>

      <div className="w-full rounded-2xl border border-hairline bg-canvas p-6 text-left shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-hairline text-2xl">{CATEGORY_META[biz.category].icon}</span>
          <div>
            <p className="heading-3">{slot.title}</p>
            <p className="text-[15px] text-muted">{biz.name}</p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-hairline pt-5 text-[15px]">
          <Row label="When" value={when(slot.start, now)} />
          <Row label="Where" value={`${biz.address}, ${biz.neighbourhood}`} />
          <Row label="You pay" value={kr(lastCallPrice(slot))} />
          {savings(slot) > 0 ? <Row label="You saved" value={kr(savings(slot))} accent /> : <Row label="Bonus" value={slot.perk ?? 'You skipped the queue'} accent />}
        </dl>
      </div>

      <p className="text-sm text-muted">{biz.name} just recovered revenue it would otherwise have lost.</p>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={() => go('/')}>
          Back to marketplace
        </Button>
        <Button onClick={() => go('/wants')}>Set up an alert</Button>
      </div>
    </div>
  )
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="eyebrow text-faint">{label}</dt>
      <dd className={`mt-0.5 font-semibold ${accent ? 'text-green' : ''}`}>{value}</dd>
    </div>
  )
}
