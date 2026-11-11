import { useState } from 'react'
import { CATEGORY_META } from '../domain/categories'
import { dashboardStats, lastCallPrice, releaseTime } from '../domain/selectors'
import { cancelSlot, releaseSlot, setCurrentBusiness, setRule, useAppState, withdrawSlot } from '../domain/store'
import type { Slot } from '../domain/types'
import { clock, countdown, dayLabel, go, kr, useNow } from '../lib'
import { Button, Card, Confetti, Modal } from '../ui'

const STATUS: Record<Slot['status'], { label: string; className: string }> = {
  booked: { label: 'Booked', className: 'bg-white' },
  cancelled: { label: '💔 Cancelled', className: 'bg-tomato/15 border-tomato' },
  held: { label: '⏳ Held for full price', className: 'bg-sunny/30' },
  released: { label: '🚀 On LastCall', className: 'bg-grape/15' },
  sold: { label: '🎉 Sold via LastCall', className: 'bg-mint/25' },
}

export function BusinessHome() {
  const state = useAppState()
  const now = useNow()
  const [releasing, setReleasing] = useState<Slot | null>(null)
  const [party, setParty] = useState(0)
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

  const celebrate = (msg: string) => {
    setParty((p) => p + 1)
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div className="flex flex-col gap-6">
      {party > 0 && <Confetti key={party} count={60} />}

      <Card className="flex flex-col gap-4 bg-grape p-6 text-white sm:flex-row sm:items-center">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-[3px] border-ink bg-white text-5xl shadow-chunky-sm">{biz.emoji}</span>
        <div className="flex-1">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-sunny">Business dashboard</p>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{biz.name}</h1>
          <p className="text-white/80">
            {CATEGORY_META[biz.category].emoji} {CATEGORY_META[biz.category].label} · 📍 {biz.neighbourhood} · {biz.tagline}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {calendarBusinesses.length > 1 && (
            <select
              value={biz.id}
              onChange={(e) => setCurrentBusiness(e.target.value)}
              className="cursor-pointer rounded-full border-2 border-ink bg-white px-3 py-2 font-display font-medium text-ink"
            >
              {calendarBusinesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.emoji} {b.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="sunny" size="sm" onClick={() => go('/biz/register')}>
            ➕ Register a business
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="order-2 flex flex-col gap-4 lg:order-1">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">📅 Your calendar</h2>
            <p className="text-sm text-ink/60">Psst: tap “Customer cancels” to simulate</p>
          </div>
          {[...days.entries()].map(([day, list]) => (
            <div key={day} className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-semibold text-ink/60">{day}</h3>
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
          ))}
        </section>

        <aside className="order-1 flex flex-col gap-6 lg:order-2">
          <Card className="overflow-hidden">
            <div className="bg-mint p-5">
              <p className="font-display text-sm font-semibold uppercase tracking-widest">Revenue recovered this month</p>
              <p key={stats.recovered} className="animate-pop font-display text-5xl font-bold tabular-nums">{kr(stats.recovered)}</p>
              <p className="mt-1 text-sm">{stats.recovered ? 'Money that would have walked out the door. 🚪💸' : "0 kr. Yet! Your first Last Call is one cancellation away."}</p>
            </div>
            <div className="grid grid-cols-3 divide-x-[3px] divide-ink border-t-[3px] border-ink text-center">
              <Stat label="Released" value={stats.released} />
              <Stat label="Sold" value={stats.sold} />
              <Stat label="Sell-through" value={`${stats.sellThrough}%`} />
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">🤖 Auto-release</h2>
              <button
                onClick={() => setRule(biz.id, { enabled: !rule.enabled })}
                className={`relative h-8 w-14 cursor-pointer rounded-full border-[3px] border-ink transition ${rule.enabled ? 'bg-mint' : 'bg-ink/15'}`}
                aria-label="Toggle Auto-release"
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full border-2 border-ink bg-white transition-all ${rule.enabled ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <p className={`text-ink/80 ${rule.enabled ? '' : 'opacity-50'}`}>
              Hold cancelled slots for full-price customers until{' '}
              <select
                value={rule.leadMinutes}
                onChange={(e) => setRule(biz.id, { leadMinutes: Number(e.target.value) })}
                className="cursor-pointer rounded-full border-2 border-ink bg-sunny px-2 font-display font-semibold"
              >
                {[30, 60, 120, 240].map((m) => (
                  <option key={m} value={m}>
                    {m < 60 ? `${m} min` : `${m / 60}h`}
                  </option>
                ))}
              </select>{' '}
              before, then release them at <b className="font-display">{rule.discountPct}% off</b>.
            </p>
            <input type="range" min={10} max={60} step={5} value={rule.discountPct} onChange={(e) => setRule(biz.id, { discountPct: Number(e.target.value) })} />
            <p className="rounded-2xl bg-cream p-3 text-sm">
              {rule.enabled ? '✅ LastCall is on autopilot. You do nothing, we fill the gap.' : '✋ Manual mode: you decide what goes on LastCall and when.'}
            </p>
          </Card>
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
            celebrate('Your Last Call is live! 🚀 Customers who want this have been alerted.')
          }}
        />
      )}

      {toast && (
        <div className="fixed inset-x-3 bottom-6 z-50 mx-auto max-w-md animate-slide-in rounded-3xl border-[3px] border-ink bg-sunny p-4 text-center font-display text-lg font-semibold shadow-chunky-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-3">
      <p key={String(value)} className="animate-pop font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">{label}</p>
    </div>
  )
}

function SlotRow({ slot, now, heldUntil, onCancel, onRelease, onWithdraw }: { slot: Slot; now: number; heldUntil: number | null; onCancel: () => void; onRelease: () => void; onWithdraw: () => void }) {
  const st = STATUS[slot.status]
  return (
    <div className={`flex flex-col gap-3 rounded-3xl border-[3px] border-ink p-4 shadow-chunky-sm transition sm:flex-row sm:items-center ${st.className}`}>
      <div className="w-16 shrink-0 font-display text-2xl font-bold tabular-nums">{clock(slot.start)}</div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold leading-tight">{slot.title}</p>
        <p className="text-sm text-ink/60">
          {slot.status === 'sold' ? `👋 ${slot.buyerName} via LastCall` : slot.status === 'booked' ? `👤 ${slot.customerName}` : `👻 was ${slot.customerName}`} · {kr(slot.fullPrice)}
        </p>
        <p className="mt-1 inline-flex flex-wrap items-center gap-2 font-display text-sm font-semibold">
          <span>{st.label}</span>
          {slot.status === 'held' && heldUntil && <span className="text-ink/60">until {clock(heldUntil)} (auto-release in {countdown(heldUntil - now)})</span>}
          {(slot.status === 'released' || slot.status === 'sold') && <span className="text-grape">{kr(lastCallPrice(slot))} (-{slot.discountPct}%)</span>}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {slot.status === 'booked' && (
          <Button size="sm" variant="secondary" onClick={onCancel}>
            💥 Customer cancels
          </Button>
        )}
        {slot.status === 'cancelled' && (
          <Button size="sm" onClick={onRelease}>
            🚀 Release
          </Button>
        )}
        {slot.status === 'held' && (
          <Button size="sm" onClick={onRelease}>
            🚀 Release now
          </Button>
        )}
        {slot.status === 'released' && (
          <Button size="sm" variant="ghost" onClick={onWithdraw}>
            ↩️ Withdraw
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="animate-wiggle text-4xl">🚀</span>
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight">Release as a Last Call</h2>
            <p className="text-sm text-ink/60">
              {slot.title} · {clock(slot.start)}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-cream p-4">
          <div className="flex items-center justify-between font-display font-semibold">
            <span>Discount</span>
            <span className="rounded-full bg-sunny px-2 text-lg">-{discount}%</span>
          </div>
          <input className="mt-2 w-full" type="range" min={0} max={70} step={5} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          <p className="mt-1 text-xs text-ink/50">✨ Suggested: {suggested}%, based on your Auto-release rule and demand nearby</p>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-ink/60">
            <s>{kr(slot.fullPrice)}</s> → customers pay
          </span>
          <span className="font-display text-3xl font-bold">{kr(price)}</span>
        </div>
        <p className="text-sm text-ink/70">
          You recover <b>{kr(price)}</b> instead of <b>0 kr</b>. Not bad for one tap.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Keep it
          </Button>
          <Button className="flex-1" onClick={() => onRelease(discount)}>
            Release it!
          </Button>
        </div>
      </div>
    </Modal>
  )
}
