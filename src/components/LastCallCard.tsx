import { businessOf } from '../domain/selectors'
import type { Slot, State } from '../domain/types'
import { when } from '../lib'
import { CategoryBadge, Countdown, DiscountSticker, Panel, Price } from '../ui'

const JUST_RELEASED = 5 * 60_000

export function LastCallCard({ state, slot, now }: { state: State; slot: Slot; now: number }) {
  const biz = businessOf(state, slot)
  const fresh = slot.releasedAt && now - slot.releasedAt < JUST_RELEASED

  return (
    <a href={`#/lc/${slot.id}`} className={`group flex flex-col border border-ink/10 bg-ivory transition duration-500 hover:-translate-y-1 hover:border-ink/30 hover:shadow-2xl hover:shadow-ink/10 ${fresh ? 'animate-glow' : ''}`}>
      <Panel category={biz.category} name={biz.name} className="aspect-[4/3]">
        <DiscountSticker slot={slot} className="absolute right-6 top-6" />
        {fresh && <span className="eyebrow absolute left-6 top-6 bg-gold px-2.5 py-1 text-[0.58rem] text-ink">Newly released</span>}
      </Panel>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={biz.category} />
          <span className="eyebrow text-stone">{biz.neighbourhood}</span>
        </div>
        <h3 className="mt-1 font-display text-[1.7rem] leading-[1.1]">{slot.title}</h3>
        <p className="font-display text-lg italic text-ink/60">{biz.name}</p>
        <p className="text-sm text-ink/60">{when(slot.start, now)}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-ink/10 pt-4">
          <Price slot={slot} />
          <Countdown start={slot.start} />
        </div>
      </div>
    </a>
  )
}
