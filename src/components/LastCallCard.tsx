import { businessOf } from '../domain/selectors'
import type { Slot, State } from '../domain/types'
import { when } from '../lib'
import { Band, CategoryBadge, Countdown, DiscountSticker, Price } from '../ui'

const JUST_RELEASED = 5 * 60_000

export function LastCallCard({ state, slot, now }: { state: State; slot: Slot; now: number }) {
  const biz = businessOf(state, slot)
  const fresh = slot.releasedAt && now - slot.releasedAt < JUST_RELEASED

  return (
    <a href={`#/lc/${slot.id}`} className={`group flex flex-col overflow-hidden rounded-xl border bg-canvas transition hover:shadow-soft ${fresh ? 'border-primary/50' : 'border-hairline'}`}>
      <Band category={biz.category} className="h-28">
        <DiscountSticker slot={slot} className="absolute right-3 top-3" />
        {fresh && <span className="eyebrow absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-white">Nettopp frigitt</span>}
      </Band>
      <div className="flex flex-1 flex-col gap-1.5 px-5 pb-5 pt-10">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={biz.category} />
          <span className="text-sm text-faint">{biz.distanceKm.toLocaleString('nb-NO')} km</span>
        </div>
        <h3 className="heading-3 mt-1.5">{slot.title}</h3>
        <p className="text-[15px] text-muted">
          {biz.name} · {biz.neighbourhood}
        </p>
        <p className="text-[15px] text-muted">{when(slot.start, now)}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-hairline pt-3">
          <Price slot={slot} />
          <Countdown start={slot.start} />
        </div>
      </div>
    </a>
  )
}
