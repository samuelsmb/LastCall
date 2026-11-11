import { useState } from 'react'
import { businessOf, savings } from '../domain/selectors'
import { bookSlot, useAppState } from '../domain/store'
import { clock, go, kr, useNow, when } from '../lib'
import { Band, Button, CategoryBadge, Countdown, DiscountSticker, Price } from '../ui'

export function LastCallDetail({ id }: { id: string }) {
  const state = useAppState()
  const now = useNow()
  const [name, setName] = useState('')
  const [tooSlow, setTooSlow] = useState(false)
  const slot = state.slots.find((s) => s.id === id)

  if (!slot) return <Gone title="This Last Call doesn't exist anymore" />
  const biz = businessOf(state, slot)
  const available = slot.status === 'released' && slot.start > now

  const book = () => {
    if (bookSlot(slot.id, name.trim() || 'Guest')) go(`/booked/${slot.id}`)
    else setTooSlow(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <a href="#/" className="self-start rounded-md px-2 py-1 text-[15px] text-muted hover:bg-black/5 hover:text-ink">
        ← Back to marketplace
      </a>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-hairline bg-canvas">
          <Band category={biz.category} className="h-48" iconSize="h-20 w-20 text-5xl">
            <DiscountSticker slot={slot} className="absolute right-5 top-5" />
          </Band>
          <div className="flex flex-col gap-3 px-6 pb-8 pt-14 sm:px-8">
            <CategoryBadge category={biz.category} />
            <h1 className="heading-1">{slot.title}</h1>
            <p className="title text-ink-2">
              {biz.name} <span className="font-normal text-muted">· {biz.tagline}</span>
            </p>
            <p className="max-w-2xl text-ink-2">{slot.description}</p>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
              <Info label="When" value={`${when(slot.start, now)} – ${clock(slot.start + slot.durationMin * 60_000)}`} />
              <Info label="Duration" value={`${slot.durationMin} min`} />
              <Info label="Address" value={`${biz.address}, ${biz.neighbourhood}`} />
              <Info label="Distance" value={`${biz.distanceKm.toLocaleString('en-GB')} km away`} />
            </dl>
          </div>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-5 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft">
            <Countdown start={slot.start} />
            <div>
              <Price slot={slot} big />
              {savings(slot) > 0 ? <p className="mt-1 font-medium text-green">You save {kr(savings(slot))}</p> : <p className="mt-1 font-medium text-green">{slot.perk ?? 'Skip the queue. Normally fully booked.'}</p>}
            </div>

            {available && !tooSlow ? (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="eyebrow text-muted">Your name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kari Nordmann"
                    className="rounded border border-[#ddd] bg-canvas px-2.5 py-2 text-[15px] outline-none placeholder:text-faint focus:shadow-soft focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <Button size="lg" onClick={book}>
                  Book now
                </Button>
                <p className="text-center text-sm text-faint">No payment needed in this demo.</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-paper p-5 text-center">
                <span className="text-3xl">🐢</span>
                <p className="title">Too slow!</p>
                <p className="text-sm text-muted">Gone! We'll ping you when the next one drops.</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="utility" onClick={() => go('/')}>
                    Browse more
                  </Button>
                  <Button size="sm" onClick={() => go('/wants')}>
                    Set up an alert
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
    <div className="bg-canvas p-4">
      <dt className="eyebrow text-faint">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}

export function Gone({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="text-5xl">🫥</span>
      <h1 className="heading-1">{title}</h1>
      <Button onClick={() => go('/')}>Back to marketplace</Button>
    </div>
  )
}
