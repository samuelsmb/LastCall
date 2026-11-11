import { useState } from 'react'
import { CATEGORY_META } from '../domain/categories'
import { businessOf, savings } from '../domain/selectors'
import { bookSlot, useAppState } from '../domain/store'
import { clock, go, kr, useNow, when } from '../lib'
import { Button, Card, CategoryBadge, Countdown, DiscountSticker, Price } from '../ui'

export function LastCallDetail({ id }: { id: string }) {
  const state = useAppState()
  const now = useNow()
  const [name, setName] = useState('')
  const [tooSlow, setTooSlow] = useState(false)
  const slot = state.slots.find((s) => s.id === id)

  if (!slot) return <Gone title="Hmm, that Last Call wandered off" />
  const biz = businessOf(state, slot)
  const meta = CATEGORY_META[biz.category]
  const available = slot.status === 'released' && slot.start > now

  const book = () => {
    if (bookSlot(slot.id, name.trim() || 'You')) go(`/booked/${slot.id}`)
    else setTooSlow(true)
  }

  return (
    <div className="flex flex-col gap-5">
      <a href="#/" className="font-display font-medium text-ink/60 hover:text-ink">
        ← Back to the Marketplace
      </a>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden">
          <div className={`relative flex h-48 items-center justify-center border-b-[3px] border-ink sm:h-64 ${meta.bg}`}>
            <span className="animate-float text-8xl drop-shadow-[4px_4px_0_rgba(30,27,46,0.35)] sm:text-9xl">{biz.emoji}</span>
            <DiscountSticker slot={slot} className="absolute right-4 top-4 text-xl" />
          </div>
          <div className="flex flex-col gap-3 p-6">
            <CategoryBadge category={biz.category} />
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{slot.title}</h1>
            <p className="font-display text-lg font-medium">
              {biz.name} <span className="text-ink/50">· {biz.tagline}</span>
            </p>
            <p className="text-ink/80">{slot.description}</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              <Info icon="🗓️" label="When" value={`${when(slot.start, now)} – ${clock(slot.start + slot.durationMin * 60_000)}`} />
              <Info icon="⏱️" label="Duration" value={`${slot.durationMin} min`} />
              <Info icon="📍" label="Where" value={`${biz.address}, ${biz.neighbourhood}`} />
              <Info icon="🚲" label="Distance" value={`${biz.distanceKm.toLocaleString('en-GB')} km away`} />
            </ul>
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="flex flex-col gap-4 p-6">
            <Countdown start={slot.start} className="self-start text-base" />
            <Price slot={slot} big />
            {savings(slot) > 0 ? (
              <p className="font-display font-semibold text-mint drop-shadow-[1px_1px_0_#1e1b2e]">You save {kr(savings(slot))} 🤑</p>
            ) : (
              slot.perk && <p className="font-display font-semibold text-grape">🏃 {slot.perk}</p>
            )}

            {available && !tooSlow ? (
              <>
                <label className="flex flex-col gap-1 font-display text-sm font-medium">
                  Your name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Karen from Nørrecool"
                    className="rounded-2xl border-[3px] border-ink bg-cream px-4 py-3 font-sans text-base outline-none focus:bg-white"
                  />
                </label>
                <Button size="lg" onClick={book}>
                  Grab it! 🙌
                </Button>
                <p className="text-center text-xs text-ink/50">No payment in this demo. Pinky promise.</p>
              </>
            ) : (
              <div className="rounded-2xl bg-ink/5 p-4 text-center">
                <p className="text-4xl">🐢</p>
                <p className="font-display text-lg font-bold">Too slow! Someone grabbed it.</p>
                <p className="text-sm text-ink/60">Save a Want so you're first next time.</p>
                <div className="mt-3 flex justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => go('/')}>
                    Browse more
                  </Button>
                  <Button size="sm" onClick={() => go('/wants')}>
                    🔔 Save a Want
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-cream p-3">
      <span className="text-2xl">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wider text-ink/50">{label}</span>
        <span className="font-display font-medium">{value}</span>
      </span>
    </li>
  )
}

export function Gone({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <span className="text-7xl">🫥</span>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <Button onClick={() => go('/')}>Back to the Marketplace</Button>
    </div>
  )
}
