import { useState } from 'react'
import { CATEGORY_META } from '../domain/categories'
import { businessOf, lastCallPrice, walkMinutes } from '../domain/selectors'
import { markAlertSeen, useAppState } from '../domain/store'
import type { Slot, State } from '../domain/types'
import { go, kr, useNow, when } from '../lib'
import { Button } from '../ui'

const RECENT = 15 * 60_000

/** "Tyre change at Ted's Garage tomorrow 14:00, 7 min away. 550 kr." */
export function alertLine(state: State, slot: Slot, now: number) {
  const biz = businessOf(state, slot)
  const day = when(slot.start, now).replace(/^(Today|Tomorrow)/, (d) => d.toLowerCase())
  return `${slot.title} at ${biz.name} ${day}, ${walkMinutes(biz)} min away. ${kr(lastCallPrice(slot))}.`
}

/** Pops up Alerts for the Customer, including ones created in another tab. */
export function AlertToasts() {
  const state = useAppState()
  const now = useNow()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const toasts = state.alerts.filter((a) => !a.seen && !dismissed.has(a.id) && now - a.createdAt < RECENT).slice(0, 3)
  if (!toasts.length) return null

  return (
    <div className="fixed inset-x-3 top-20 z-50 flex flex-col gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-[380px]">
      {toasts.map((a) => {
        const slot = state.slots.find((s) => s.id === a.slotId)
        const want = state.wants.find((w) => w.id === a.wantId)
        if (!slot) return null
        const biz = businessOf(state, slot)
        return (
          <div key={a.id} className="animate-rise rounded-2xl border border-hairline bg-canvas p-4 shadow-lifted">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-hairline text-xl">{CATEGORY_META[biz.category].icon}</span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-primary">🔔 Someone cancelled</p>
                <p className="mt-0.5 font-semibold leading-snug">{alertLine(state, slot, now)}</p>
                {want && <p className="mt-2 text-sm text-ink-2">Matches your Want “{want.label}”</p>}
              </div>
              <button className="cursor-pointer rounded-md px-1.5 text-lg leading-none text-faint hover:bg-black/5 hover:text-ink" onClick={() => setDismissed(new Set(dismissed).add(a.id))} aria-label="Dismiss">
                ×
              </button>
            </div>
            <Button
              size="sm"
              className="mt-3 w-full py-2!"
              onClick={() => {
                markAlertSeen(a.id)
                go(`/lc/${slot.id}`)
              }}
            >
              View Last Call
            </Button>
          </div>
        )
      })}
    </div>
  )
}
