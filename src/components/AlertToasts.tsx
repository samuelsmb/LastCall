import { useState } from 'react'
import { businessOf } from '../domain/selectors'
import { markAlertSeen, useAppState } from '../domain/store'
import { go, useNow, when } from '../lib'
import { BellIcon } from '../ui'

const RECENT = 15 * 60_000

/** Pops up Alerts for the Customer, including ones created in another tab. */
export function AlertToasts() {
  const state = useAppState()
  const now = useNow()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const toasts = state.alerts.filter((a) => !a.seen && !dismissed.has(a.id) && now - a.createdAt < RECENT).slice(0, 3)
  if (!toasts.length) return null

  return (
    <div className="fixed inset-x-3 top-24 z-50 flex flex-col gap-3 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:top-auto sm:w-[26rem]">
      {toasts.map((a) => {
        const slot = state.slots.find((s) => s.id === a.slotId)
        const want = state.wants.find((w) => w.id === a.wantId)
        if (!slot) return null
        const biz = businessOf(state, slot)
        return (
          <div key={a.id} className="animate-rise border border-gold/50 bg-ink p-6 text-paper shadow-2xl shadow-ink/30">
            <div className="flex items-start gap-4">
              <BellIcon className="mt-1 h-8 w-7 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-gold">A private notice</p>
                <p className="mt-2 font-display text-2xl leading-tight">{biz.name} has released a reservation</p>
                <p className="mt-2 text-sm text-paper/70">
                  {slot.title} · {when(slot.start, now)} · {biz.neighbourhood}
                </p>
                {want && <p className="mt-3 font-display text-base italic text-gold-light">In accordance with your Want, “{want.label}”.</p>}
              </div>
              <button className="cursor-pointer text-lg leading-none text-paper/40 hover:text-paper" onClick={() => setDismissed(new Set(dismissed).add(a.id))} aria-label="Dismiss">
                ×
              </button>
            </div>
            <button
              onClick={() => {
                markAlertSeen(a.id)
                go(`/lc/${slot.id}`)
              }}
              className="eyebrow mt-5 w-full cursor-pointer bg-gold py-3.5 text-ink transition hover:bg-gold-light"
            >
              View reservation
            </button>
          </div>
        )
      })}
    </div>
  )
}
