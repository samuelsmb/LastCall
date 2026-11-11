import { useState } from 'react'
import { businessOf, savings } from '../domain/selectors'
import { bookSlot, useAppState } from '../domain/store'
import { clock, go, kr, useNow, when } from '../lib'
import { Button, CategoryBadge, Countdown, DiscountSticker, Panel, Price } from '../ui'

export function LastCallDetail({ id }: { id: string }) {
  const state = useAppState()
  const now = useNow()
  const [name, setName] = useState('')
  const [tooSlow, setTooSlow] = useState(false)
  const slot = state.slots.find((s) => s.id === id)

  if (!slot) return <Gone title="This reservation is no longer with us." />
  const biz = businessOf(state, slot)
  const available = slot.status === 'released' && slot.start > now

  const book = () => {
    if (bookSlot(slot.id, name.trim() || 'Guest')) go(`/booked/${slot.id}`)
    else setTooSlow(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <a href="#/" className="eyebrow text-stone transition hover:text-ink">
        ← Return to the Collection
      </a>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <article className="flex flex-col gap-8">
          <Panel category={biz.category} name={biz.name} className="aspect-[16/10]" monogram="text-[9rem]">
            <DiscountSticker slot={slot} className="absolute right-8 top-8 text-2xl" />
          </Panel>
          <div className="flex flex-col gap-4">
            <CategoryBadge category={biz.category} />
            <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl">{slot.title}</h1>
            <p className="font-display text-2xl italic text-ink/70">
              {biz.name}, <span className="text-stone">{biz.tagline.charAt(0).toLowerCase() + biz.tagline.slice(1)}</span>
            </p>
            <p className="max-w-2xl text-lg leading-relaxed text-ink/75">{slot.description}</p>
          </div>
          <dl className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
            <Info label="When" value={`${when(slot.start, now)} – ${clock(slot.start + slot.durationMin * 60_000)}`} />
            <Info label="Duration" value={`${slot.durationMin} minutes`} />
            <Info label="Address" value={`${biz.address}, ${biz.neighbourhood}`} />
            <Info label="Distance" value={`${biz.distanceKm.toLocaleString('en-GB')} km from you`} />
          </dl>
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-6 border border-ink/15 bg-ivory p-8">
            <Countdown start={slot.start} />
            <div className="flex flex-col gap-2">
              <Price slot={slot} big />
              {savings(slot) > 0 ? (
                <p className="font-display text-lg italic text-gold">A saving of {kr(savings(slot))}</p>
              ) : (
                slot.perk && <p className="font-display text-lg italic text-gold">{slot.perk}</p>
              )}
            </div>

            {available && !tooSlow ? (
              <>
                <label className="flex flex-col gap-2">
                  <span className="eyebrow text-stone">Name for the reservation</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mr. or Ms. …"
                    className="border-b border-ink/30 bg-transparent py-2 font-display text-2xl outline-none placeholder:italic placeholder:text-ink/30 focus:border-gold"
                  />
                </label>
                <Button size="lg" onClick={book}>
                  Secure reservation
                </Button>
                <p className="text-center text-xs leading-relaxed text-stone">Settled discreetly with the establishment. No payment is taken in this demonstration.</p>
              </>
            ) : (
              <div className="flex flex-col gap-3 border-t border-ink/10 pt-6 text-center">
                <p className="eyebrow text-oxblood">No longer available</p>
                <p className="font-display text-2xl">Regrettably, another guest was quicker.</p>
                <p className="text-sm text-stone">Leave a Want, and you shall be the first to know next time.</p>
                <div className="mt-2 flex justify-center gap-3">
                  <Button size="sm" variant="secondary" onClick={() => go('/')}>
                    The Collection
                  </Button>
                  <Button size="sm" onClick={() => go('/wants')}>
                    Leave a Want
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ivory p-5">
      <dt className="eyebrow text-stone">{label}</dt>
      <dd className="mt-1 font-display text-xl">{value}</dd>
    </div>
  )
}

export function Gone({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <p className="eyebrow text-gold">Our apologies</p>
      <h1 className="font-display text-5xl">{title}</h1>
      <Button onClick={() => go('/')}>Return to the Collection</Button>
    </div>
  )
}
