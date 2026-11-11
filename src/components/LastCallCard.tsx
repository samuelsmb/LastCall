import { CATEGORY_META } from '../domain/categories'
import { businessOf } from '../domain/selectors'
import type { Slot, State } from '../domain/types'
import { when } from '../lib'
import { Countdown, DiscountSticker, Price } from '../ui'

const JUST_RELEASED = 5 * 60_000

export function LastCallCard({ state, slot, now }: { state: State; slot: Slot; now: number }) {
  const biz = businessOf(state, slot)
  const meta = CATEGORY_META[biz.category]
  const fresh = slot.releasedAt && now - slot.releasedAt < JUST_RELEASED

  return (
    <a
      href={`#/lc/${slot.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-white shadow-chunky transition duration-200 hover:-translate-y-1.5 hover:rotate-[-0.6deg] hover:shadow-chunky-lg ${fresh ? 'animate-pulse-ring' : ''}`}
    >
      <div className={`relative flex h-28 items-center justify-center border-b-[3px] border-ink ${meta.bg}`}>
        <span className="text-6xl drop-shadow-[3px_3px_0_rgba(30,27,46,0.35)] transition group-hover:scale-110 group-hover:rotate-6">{biz.emoji}</span>
        <DiscountSticker slot={slot} className="absolute right-3 top-3 text-sm" />
        {fresh && (
          <span className="absolute left-3 top-3 -rotate-6 rounded-full border-2 border-ink bg-white px-2 py-0.5 font-display text-xs font-bold">
            🆕 just released
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink/60">
          <span>{meta.emoji} {meta.label}</span>
          <span>·</span>
          <span>📍 {biz.neighbourhood}</span>
        </div>
        <h3 className="font-display text-lg font-bold leading-tight">{slot.title}</h3>
        <p className="text-sm text-ink/70">
          {biz.name} · {when(slot.start, now)}
        </p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
          <Price slot={slot} />
          <Countdown start={slot.start} />
        </div>
      </div>
    </a>
  )
}
