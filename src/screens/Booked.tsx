import { businessOf, lastCallPrice, savings } from '../domain/selectors'
import { useAppState } from '../domain/store'
import { go, kr, useNow, when } from '../lib'
import { Button, Card, Confetti } from '../ui'
import { Gone } from './LastCallDetail'

export function Booked({ id }: { id: string }) {
  const state = useAppState()
  const now = useNow()
  const slot = state.slots.find((s) => s.id === id)
  if (!slot || slot.status !== 'sold') return <Gone title="No booking here" />
  const biz = businessOf(state, slot)

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-6 text-center">
      <Confetti />
      <span className="animate-pop text-8xl">🥳</span>
      <h1 className="font-display text-5xl font-bold">You're in{slot.buyerName && slot.buyerName !== 'You' ? `, ${slot.buyerName.split(' ')[0]}` : ''}!</h1>
      <p className="text-lg text-ink/70">Someone's cancellation just became your plan. Nice.</p>

      <Card className="w-full rotate-[-1deg] p-6 text-left">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-tomato">Your Last Call ticket</p>
        <h2 className="mt-1 font-display text-2xl font-bold">
          {biz.emoji} {slot.title}
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink/50">Where</dt>
            <dd className="font-display font-semibold">{biz.name}</dd>
            <dd>{biz.address}, {biz.neighbourhood}</dd>
          </div>
          <div>
            <dt className="text-ink/50">When</dt>
            <dd className="font-display font-semibold">{when(slot.start, now)}</dd>
          </div>
          <div>
            <dt className="text-ink/50">You pay</dt>
            <dd className="font-display text-xl font-bold">{kr(lastCallPrice(slot))}</dd>
          </div>
          <div>
            <dt className="text-ink/50">You saved</dt>
            <dd className="font-display text-xl font-bold text-mint drop-shadow-[1px_1px_0_#1e1b2e]">{savings(slot) > 0 ? kr(savings(slot)) : slot.perk ?? '–'}</dd>
          </div>
        </dl>
        <div className="mt-5 border-t-[3px] border-dashed border-ink/20 pt-4 text-center font-display text-sm text-ink/60">
          {biz.name} got back revenue they thought was lost. Everybody wins. 🫶
        </div>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={() => go('/')}>
          Back to the Marketplace
        </Button>
        <Button variant="sunny" onClick={() => go('/wants')}>
          🔔 Never miss one again
        </Button>
      </div>
    </div>
  )
}
