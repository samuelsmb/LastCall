import { useState } from 'react'
import { WINDOW_META } from '../domain/categories'
import { businessOf } from '../domain/selectors'
import { markAlertSeen, useAppState } from '../domain/store'
import { go, when } from '../lib'

const RECENT = 15 * 60_000

/** Pops up Alerts for the Customer, including ones created in another tab. */
export function AlertToasts() {
  const state = useAppState()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const now = Date.now()

  const toasts = state.alerts.filter((a) => !a.seen && !dismissed.has(a.id) && now - a.createdAt < RECENT).slice(0, 3)
  if (!toasts.length) return null

  return (
    <div className="fixed inset-x-3 top-20 z-50 flex flex-col gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-96">
      {toasts.map((a) => {
        const slot = state.slots.find((s) => s.id === a.slotId)
        const want = state.wants.find((w) => w.id === a.wantId)
        if (!slot) return null
        const biz = businessOf(state, slot)
        return (
          <div key={a.id} className="animate-slide-in rounded-3xl border-[3px] border-ink bg-white p-4 shadow-chunky-lg">
            <div className="flex items-start gap-3">
              <span className="animate-wiggle text-3xl">🔔</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs font-semibold uppercase tracking-wider text-tomato">Psst! A Last Call for you</p>
                <p className="font-display text-lg font-bold leading-tight">
                  {biz.emoji} {biz.name} just freed up a slot
                </p>
                <p className="mt-1 text-sm text-ink/70">
                  {slot.title} · {when(slot.start, now)} · 📍 {biz.neighbourhood}
                </p>
                {want && (
                  <p className="mt-2 inline-block rounded-full bg-grape/15 px-2 py-0.5 text-xs font-semibold text-grape">
                    ✨ Matches your Want “{want.label}” ({WINDOW_META[want.window].hint})
                  </p>
                )}
              </div>
              <button className="cursor-pointer text-xl leading-none text-ink/40 hover:text-ink" onClick={() => setDismissed(new Set(dismissed).add(a.id))} aria-label="Dismiss">
                ×
              </button>
            </div>
            <button
              onClick={() => {
                markAlertSeen(a.id)
                go(`/lc/${slot.id}`)
              }}
              className="mt-3 w-full cursor-pointer rounded-full border-[3px] border-ink bg-tomato py-2 font-display font-semibold text-white shadow-chunky-sm transition hover:-translate-y-0.5"
            >
              Grab it before someone else does →
            </button>
          </div>
        )
      })}
    </div>
  )
}
