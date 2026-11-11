import { useState } from 'react'
import { CATEGORY_META } from '../domain/categories'
import { dashboardStats, lastCallPrice, releaseTime } from '../domain/selectors'
import { cancelSlot, releaseSlot, setCurrentBusiness, setRule, useAppState, withdrawSlot } from '../domain/store'
import type { Slot } from '../domain/types'
import { clock, countdown, dayLabel, go, kr, useNow } from '../lib'
import { Button, Modal, Panel } from '../ui'

const STATUS: Record<Slot['status'], { label: string; tone: string; row: string }> = {
  booked: { label: 'Confirmed', tone: 'text-stone', row: '' },
  cancelled: { label: 'Cancelled', tone: 'text-oxblood', row: 'bg-oxblood/[0.04]' },
  held: { label: 'Held for full-paying clientele', tone: 'text-gold', row: 'bg-gold/[0.06]' },
  released: { label: 'Released on LastCall', tone: 'text-ink', row: 'bg-ink/[0.03]' },
  sold: { label: 'Reclaimed via LastCall', tone: 'text-[#3b6a57]', row: 'bg-[#3b6a57]/[0.06]' },
}

export function BusinessHome() {
  const state = useAppState()
  const now = useNow()
  const [releasing, setReleasing] = useState<Slot | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const biz = state.businesses.find((b) => b.id === state.currentBusinessId) ?? state.businesses[0]
  const rule = state.rules[biz.id] ?? { enabled: false, leadMinutes: 60, discountPct: 30 }
  const stats = dashboardStats(state, biz.id)
  const calendarBusinesses = state.businesses.filter((b) => state.slots.some((s) => s.businessId === b.id && s.customerName))
  const slots = state.slots.filter((s) => s.businessId === biz.id && s.customerName && s.start + s.durationMin * 60_000 > now).sort((a, b) => a.start - b.start)

  const days = new Map<string, Slot[]>()
  for (const s of slots) {
    const d = dayLabel(s.start, now)
    days.set(d, [...(days.get(d) ?? []), s])
  }

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-8 border-b border-ink/10 pb-10 sm:flex-row sm:items-end">
        <Panel category={biz.category} name={biz.name} className="h-28 w-28 shrink-0" monogram="text-5xl" />
        <div className="flex-1">
          <p className="eyebrow text-gold">Establishment · {CATEGORY_META[biz.category].label}</p>
          <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">{biz.name}</h1>
          <p className="mt-3 font-display text-xl italic text-stone">
            {biz.tagline} · {biz.neighbourhood}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {calendarBusinesses.length > 1 && (
            <select value={biz.id} onChange={(e) => setCurrentBusiness(e.target.value)} className="cursor-pointer border-b border-ink/30 bg-transparent py-1 font-display text-lg italic outline-none">
              {calendarBusinesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="secondary" size="sm" onClick={() => go('/biz/register')}>
            Admit a new establishment
          </Button>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <section className="order-2 flex flex-col gap-8 lg:order-1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="eyebrow text-gold">The Book</p>
              <h2 className="font-display text-4xl">Reservations</h2>
            </div>
            <p className="font-display italic text-stone">“Simulate cancellation” to demonstrate</p>
          </div>
          {[...days.entries()].map(([day, list]) => (
            <div key={day} className="flex flex-col">
              <h3 className="eyebrow border-b border-ink/15 pb-3 text-stone">{day}</h3>
              <div className="flex flex-col divide-y divide-ink/10">
                {list.map((s) => (
                  <SlotRow
                    key={s.id}
                    slot={s}
                    now={now}
                    heldUntil={s.status === 'held' ? releaseTime(state, s) : null}
                    onCancel={() => cancelSlot(s.id)}
                    onRelease={() => setReleasing(s)}
                    onWithdraw={() => withdrawSlot(s.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="order-1 flex flex-col gap-8 lg:order-2">
          <div className="bg-ink p-8 text-paper">
            <p className="eyebrow text-gold">Revenue reclaimed this month</p>
            <p key={stats.recovered} className="mt-3 animate-rise font-display text-6xl tabular-nums">
              {kr(stats.recovered)}
            </p>
            <p className="mt-3 font-display text-lg italic text-paper/60">
              {stats.recovered ? 'Revenue that would otherwise have quietly left the building.' : 'Nothing yet. Your first Last Call is but one cancellation away.'}
            </p>
            <div className="mt-8 grid grid-cols-3 border-t border-paper/15 pt-6">
              <Stat label="Released" value={stats.released} />
              <Stat label="Reclaimed" value={stats.sold} />
              <Stat label="Sell-through" value={`${stats.sellThrough}%`} />
            </div>
          </div>

          <div className="flex flex-col gap-5 border border-ink/10 bg-ivory p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-gold">Auto-release</p>
                <h2 className="font-display text-3xl">The Concierge</h2>
              </div>
              <button
                onClick={() => setRule(biz.id, { enabled: !rule.enabled })}
                className={`relative h-7 w-12 cursor-pointer rounded-full border transition ${rule.enabled ? 'border-ink bg-ink' : 'border-ink/30 bg-transparent'}`}
                aria-label="Toggle Auto-release"
              >
                <span className={`absolute top-[3px] h-5 w-5 rounded-full transition-all ${rule.enabled ? 'left-[22px] bg-gold' : 'left-[3px] bg-ink/30'}`} />
              </button>
            </div>
            <p className={`font-display text-xl leading-snug ${rule.enabled ? '' : 'opacity-45'}`}>
              Hold cancelled reservations for full-paying clientele until{' '}
              <select value={rule.leadMinutes} onChange={(e) => setRule(biz.id, { leadMinutes: Number(e.target.value) })} className="cursor-pointer border-b border-gold bg-transparent italic outline-none">
                {[30, 60, 120, 240].map((m) => (
                  <option key={m} value={m}>
                    {m < 60 ? `${m} minutes` : m === 60 ? 'one hour' : `${m / 60} hours`}
                  </option>
                ))}
              </select>{' '}
              before, then release them discreetly at <em className="text-gold">{rule.discountPct}% off</em>.
            </p>
            <input type="range" min={10} max={60} step={5} value={rule.discountPct} onChange={(e) => setRule(biz.id, { discountPct: Number(e.target.value) })} />
            <p className="border-t border-ink/10 pt-4 text-sm text-stone">
              {rule.enabled ? 'The Concierge is attending to your cancellations. You need do nothing at all.' : 'Manual discretion: you decide what is released, and when.'}
            </p>
          </div>
        </aside>
      </div>

      {releasing && (
        <ReleaseDialog
          slot={releasing}
          suggested={rule.discountPct}
          onClose={() => setReleasing(null)}
          onRelease={(d) => {
            releaseSlot(releasing.id, d)
            setReleasing(null)
            notify('Released. Guests with a matching Want have been discreetly informed.')
          }}
        />
      )}

      {toast && (
        <div className="fixed inset-x-3 bottom-8 z-50 mx-auto max-w-lg animate-rise border border-gold/50 bg-ink px-6 py-5 text-center font-display text-xl italic text-paper shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p key={String(value)} className="animate-rise font-display text-3xl tabular-nums">
        {value}
      </p>
      <p className="eyebrow mt-1 text-[0.58rem] text-paper/50">{label}</p>
    </div>
  )
}

function SlotRow({ slot, now, heldUntil, onCancel, onRelease, onWithdraw }: { slot: Slot; now: number; heldUntil: number | null; onCancel: () => void; onRelease: () => void; onWithdraw: () => void }) {
  const st = STATUS[slot.status]
  return (
    <div className={`flex flex-col gap-4 px-2 py-6 transition sm:flex-row sm:items-center ${st.row}`}>
      <div className="w-20 shrink-0 font-display text-3xl tabular-nums">{clock(slot.start)}</div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-2xl leading-tight">{slot.title}</p>
        <p className="mt-1 text-sm text-stone">
          {slot.status === 'sold' ? `${slot.buyerName}, via LastCall` : slot.status === 'booked' ? slot.customerName : `Formerly ${slot.customerName}`} · {kr(slot.fullPrice)}
        </p>
        <p className={`eyebrow mt-2 ${st.tone}`}>
          {st.label}
          {slot.status === 'held' && heldUntil && <span className="text-stone"> · until {clock(heldUntil)}, in {countdown(heldUntil - now)}</span>}
          {(slot.status === 'released' || slot.status === 'sold') && (
            <span className="text-stone">
              {' '}
              · {kr(lastCallPrice(slot))} (−{slot.discountPct}%)
            </span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        {slot.status === 'booked' && (
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Simulate cancellation
          </Button>
        )}
        {slot.status === 'cancelled' && (
          <Button size="sm" onClick={onRelease}>
            Release
          </Button>
        )}
        {slot.status === 'held' && (
          <Button size="sm" variant="secondary" onClick={onRelease}>
            Release now
          </Button>
        )}
        {slot.status === 'released' && (
          <Button size="sm" variant="ghost" onClick={onWithdraw}>
            Withdraw
          </Button>
        )}
      </div>
    </div>
  )
}

function ReleaseDialog({ slot, suggested, onClose, onRelease }: { slot: Slot; suggested: number; onClose: () => void; onRelease: (discountPct: number) => void }) {
  const [discount, setDiscount] = useState(suggested)
  const price = lastCallPrice({ ...slot, discountPct: discount })
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="eyebrow text-gold">Release to LastCall</p>
          <h2 className="mt-2 font-display text-4xl leading-tight">{slot.title}</h2>
          <p className="font-display text-lg italic text-stone">{clock(slot.start)}, formerly reserved by {slot.customerName}</p>
        </div>
        <div className="border-y border-ink/10 py-5">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow text-stone">Courtesy reduction</span>
            <span className="font-display text-3xl italic">−{discount}%</span>
          </div>
          <input className="mt-3 w-full" type="range" min={0} max={70} step={5} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          <p className="mt-2 text-xs text-stone">Recommended: {suggested}%, informed by your Auto-release rule and demand in the area.</p>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-stone">
            <s>{kr(slot.fullPrice)}</s> → guests pay
          </span>
          <span className="font-display text-4xl">{kr(price)}</span>
        </div>
        <p className="font-display text-lg italic text-ink/70">You reclaim {kr(price)}, rather than nothing at all.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Keep it
          </Button>
          <Button className="flex-1" onClick={() => onRelease(discount)}>
            Release
          </Button>
        </div>
      </div>
    </Modal>
  )
}
