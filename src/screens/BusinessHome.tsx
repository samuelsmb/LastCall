import { useState } from 'react'
import { CATEGORY_META } from '../domain/categories'
import { dashboardStats, DEFAULT_RULE, lastCallPrice, releaseTime } from '../domain/selectors'
import { cancelSlot, releaseSlot, setCurrentBusiness, setRule, useAppState, withdrawSlot } from '../domain/store'
import type { AutoReleaseRule, ReleaseMode, Slot } from '../domain/types'
import { clock, countdown, dayLabel, go, kr, useNow } from '../lib'
import { Button, Modal, Segmented } from '../ui'

const STATUS: Record<Slot['status'], { label: string; pill: string }> = {
  booked: { label: 'Booked', pill: 'bg-black/5 text-ink-2' },
  cancelled: { label: 'Cancelled', pill: 'bg-orange/10 text-orange-deep' },
  held: { label: 'Held for full price', pill: 'bg-purple/30 text-purple-deep' },
  released: { label: 'On LastCall', pill: 'bg-sky/20 text-[#1d5d94]' },
  sold: { label: 'Sold via LastCall', pill: 'bg-green/10 text-[#13772a]' },
}

export function BusinessHome() {
  const state = useAppState()
  const now = useNow()
  const [releasing, setReleasing] = useState<Slot | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const biz = state.businesses.find((b) => b.id === state.currentBusinessId) ?? state.businesses[0]
  const meta = CATEGORY_META[biz.category]
  const rule = state.rules[biz.id] ?? DEFAULT_RULE
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
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-hairline bg-canvas text-4xl shadow-soft">{meta.icon}</span>
        <div className="flex-1">
          <h1 className="heading-1">{biz.name}</h1>
          <p className="mt-1 text-muted">
            {meta.label} · {biz.neighbourhood} · {biz.tagline}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {calendarBusinesses.length > 1 && (
            <select value={biz.id} onChange={(e) => setCurrentBusiness(e.target.value)} className="cursor-pointer rounded-lg border border-hairline bg-canvas px-2.5 py-1.5 text-[15px] font-medium outline-none">
              {calendarBusinesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="utility" size="sm" onClick={() => go('/biz/register')}>
            + Add business
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-hairline bg-canvas p-5 sm:col-span-2">
          <p className="eyebrow text-muted">Recovered this month</p>
          <p key={stats.recovered} className="display-2 mt-2 animate-rise tabular-nums">
            {kr(stats.recovered)}
          </p>
          <p className="mt-2 text-sm text-muted">{stats.recovered ? 'Revenue from cancellations that would otherwise be lost.' : 'Nothing yet. Your first Last Call is one cancellation away.'}</p>
        </div>
        <Stat label="Released" value={stats.released} />
        <div className="grid gap-4">
          <Stat label="Sold" value={stats.sold} compact />
          <Stat label="Sell-through" value={`${stats.sellThrough}%`} compact />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="order-2 flex flex-col gap-4 lg:order-1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="heading-2">Calendar</h2>
            <p className="text-sm text-muted">Use “Simulate cancellation” to demo a cancellation coming in</p>
          </div>
          {[...days.entries()].map(([day, list]) => (
            <div key={day} className="overflow-hidden rounded-xl border border-hairline bg-canvas">
              <h3 className="eyebrow border-b border-hairline bg-paper px-4 py-2 text-muted">{day}</h3>
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

        <aside className="order-1 lg:order-2">
          <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-canvas p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple/40 text-base">⚡</span>
                <h2 className="title">Auto-release</h2>
              </div>
              <button
                onClick={() => setRule(biz.id, { enabled: !rule.enabled })}
                className={`relative h-6 w-10 cursor-pointer rounded-full transition ${rule.enabled ? 'bg-primary' : 'bg-black/15'}`}
                aria-label="Toggle Auto-release"
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${rule.enabled ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>
            <Segmented
              value={rule.mode}
              onChange={(m) => m && setRule(biz.id, { mode: m })}
              options={[
                { value: 'full', label: 'Full price' },
                { value: 'discount', label: 'Discount' },
              ]}
            />
            {rule.mode === 'full' ? (
              <p className={`text-[15px] leading-relaxed text-ink-2 ${rule.enabled ? '' : 'opacity-50'}`}>
                Release cancelled slots straight away at <b className="font-semibold">full price</b>. Customers see them as <b className="font-semibold">Skip the queue</b>.
              </p>
            ) : (
              <>
                <p className={`text-[15px] leading-relaxed text-ink-2 ${rule.enabled ? '' : 'opacity-50'}`}>
                  Hold cancelled slots for full-price customers until{' '}
                  <select value={rule.leadMinutes} onChange={(e) => setRule(biz.id, { leadMinutes: Number(e.target.value) })} className="cursor-pointer rounded border border-hairline bg-paper px-1 font-medium outline-none">
                    {[30, 60, 120, 240].map((m) => (
                      <option key={m} value={m}>
                        {m < 60 ? `${m} min` : `${m / 60} hour${m === 60 ? '' : 's'}`}
                      </option>
                    ))}
                  </select>{' '}
                  before they start, then release them at <b className="font-semibold">{rule.discountPct}% off</b>.
                </p>
                <input type="range" min={5} max={60} step={5} value={rule.discountPct} onChange={(e) => setRule(biz.id, { discountPct: Number(e.target.value) })} />
              </>
            )}
            <p className="rounded-lg bg-paper p-3 text-sm text-muted">
              {rule.enabled ? 'On: LastCall handles cancellations for you automatically.' : 'Off: you choose what to release and when.'}
            </p>
          </div>
        </aside>
      </div>

      {releasing && (
        <ReleaseDialog
          slot={releasing}
          rule={rule}
          onClose={() => setReleasing(null)}
          onRelease={(d) => {
            releaseSlot(releasing.id, d)
            setReleasing(null)
            notify('Released. Customers with a matching Want have been alerted.')
          }}
        />
      )}

      {toast && (
        <div className="fixed inset-x-3 bottom-6 z-50 mx-auto flex max-w-md animate-rise items-center gap-3 rounded-xl border border-hairline bg-canvas px-4 py-3 shadow-lifted">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green text-sm text-white">✓</span>
          <span className="text-[15px]">{toast}</span>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, compact = false }: { label: string; value: number | string; compact?: boolean }) {
  return (
    <div className="rounded-xl border border-hairline bg-canvas p-5">
      <p className="eyebrow text-muted">{label}</p>
      <p key={String(value)} className={`mt-1 animate-rise tabular-nums ${compact ? 'heading-2' : 'display-2 mt-2'}`}>
        {value}
      </p>
    </div>
  )
}

function SlotRow({ slot, now, heldUntil, onCancel, onRelease, onWithdraw }: { slot: Slot; now: number; heldUntil: number | null; onCancel: () => void; onRelease: () => void; onWithdraw: () => void }) {
  const st = STATUS[slot.status]
  return (
    <div className="flex flex-col gap-3 border-b border-hairline px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center">
      <div className="w-14 shrink-0 font-semibold tabular-nums">{clock(slot.start)}</div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{slot.title}</p>
        <p className="text-sm text-muted">
          {slot.status === 'sold' ? `${slot.buyerName} via LastCall` : slot.status === 'booked' ? slot.customerName : `Was ${slot.customerName}`} · {kr(slot.fullPrice)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`eyebrow rounded px-2 py-1 ${st.pill}`}>
          {st.label}
          {slot.status === 'held' && heldUntil && ` · releases ${clock(heldUntil)} (${countdown(heldUntil - now)})`}
          {(slot.status === 'released' || slot.status === 'sold') && ` · ${kr(lastCallPrice(slot))}`}
        </span>
        {slot.status === 'booked' && (
          <Button size="sm" variant="utility" onClick={onCancel}>
            Simulate cancellation
          </Button>
        )}
        {slot.status === 'cancelled' && (
          <Button size="sm" onClick={onRelease}>
            Release
          </Button>
        )}
        {slot.status === 'held' && (
          <Button size="sm" variant="utility" onClick={onRelease}>
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

function ReleaseDialog({ slot, rule, onClose, onRelease }: { slot: Slot; rule: AutoReleaseRule; onClose: () => void; onRelease: (discountPct: number) => void }) {
  const [mode, setMode] = useState<ReleaseMode>(rule.mode)
  const [pct, setPct] = useState(rule.discountPct || 20)
  const discount = mode === 'full' ? 0 : pct
  const price = lastCallPrice({ ...slot, discountPct: discount })
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="heading-2">Release as a Last Call</h2>
          <p className="mt-1 text-[15px] text-muted">
            {slot.title} · {clock(slot.start)} · was booked by {slot.customerName}
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-paper p-4">
          <Segmented
            value={mode}
            onChange={(m) => m && setMode(m)}
            options={[
              { value: 'full', label: 'Full price' },
              { value: 'discount', label: 'Discount' },
            ]}
          />
          {mode === 'full' ? (
            <p className="text-sm text-muted">Customers see it as “Skip the queue”. No discount needed: you set the price.</p>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Discount</span>
                <span className="title">{pct}%</span>
              </div>
              <input className="mt-2 w-full" type="range" min={5} max={70} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <span className="rounded bg-purple/40 px-1.5 text-xs text-purple-deep">✦ AI</span>
                Suggested {rule.discountPct}% based on your Auto-release rule and demand nearby
              </p>
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted">{discount > 0 ? <><s>{kr(slot.fullPrice)}</s> → customers pay</> : 'Customers pay'}</span>
          <span className="heading-1">{kr(price)}</span>
        </div>
        <p className="text-[15px] text-ink-2">
          You recover <b className="font-semibold">{kr(price)}</b> instead of <b className="font-semibold">{kr(0)}</b>.
        </p>
        <div className="flex gap-2">
          <Button variant="utility" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => onRelease(discount)}>
            Release
          </Button>
        </div>
      </div>
    </Modal>
  )
}
