import { businessOf, lastCallPrice, savings } from '../domain/selectors'
import { useAppState } from '../domain/store'
import { go, kr, useNow, when } from '../lib'
import { BellIcon, Button, Ornament } from '../ui'
import { Gone } from './LastCallDetail'

export function Booked({ id }: { id: string }) {
  const state = useAppState()
  const now = useNow()
  const slot = state.slots.find((s) => s.id === id)
  if (!slot || slot.status !== 'sold') return <Gone title="We have no record of this reservation." />
  const biz = businessOf(state, slot)
  const guest = slot.buyerName && slot.buyerName !== 'Guest' ? slot.buyerName : 'our guest'

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 py-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <BellIcon className="h-14 w-12 text-gold" />
        <p className="eyebrow text-gold">Reservation confirmed</p>
        <h1 className="font-display text-6xl sm:text-7xl">
          <em>Splendid.</em>
        </h1>
        <p className="max-w-md text-lg text-ink/60">Someone else's change of plans has become yours. As it should be.</p>
      </div>

      <div className="relative w-full bg-ivory p-3 shadow-2xl shadow-ink/10">
        <div className="border border-gold/50 px-8 py-12 sm:px-14">
          <p className="font-display text-lg italic text-ink/60">{biz.name}</p>
          <p className="font-display text-lg italic text-ink/60">requests the pleasure of the company of</p>
          <p className="mt-4 font-display text-5xl">{guest}</p>
          <Ornament className="my-6" />
          <p className="font-display text-3xl">{slot.title}</p>
          <p className="mt-3 eyebrow text-stone">{when(slot.start, now)}</p>
          <p className="mt-1 eyebrow text-stone">
            {biz.address}, {biz.neighbourhood}
          </p>
          <div className="mt-10 grid grid-cols-2 border-t border-ink/10 pt-6">
            <div>
              <p className="eyebrow text-stone">Settled</p>
              <p className="mt-1 font-display text-3xl">{kr(lastCallPrice(slot))}</p>
            </div>
            <div>
              <p className="eyebrow text-stone">Your saving</p>
              <p className="mt-1 font-display text-3xl italic text-gold">{savings(slot) > 0 ? kr(savings(slot)) : slot.perk ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="font-display text-xl italic text-stone">{biz.name} has recovered revenue it had quite given up on. Everyone is better off.</p>

      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="secondary" onClick={() => go('/')}>
          Return to the Collection
        </Button>
        <Button onClick={() => go('/wants')}>Never miss another</Button>
      </div>
    </div>
  )
}
