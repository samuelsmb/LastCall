import { CATEGORY_META } from '../domain/categories'
import { businessOf, lastCallPrice } from '../domain/selectors'
import type { Slot, State } from '../domain/types'
import { kr, when } from '../lib'
import { Band, CategoryBadge, Countdown, DiscountSticker, Price, SiteImage } from '../ui'

const JUST_RELEASED = 5 * 60_000

export function LastCallCard({ state, slot, now, compact = false, onOpen }: { state: State; slot: Slot; now: number; compact?: boolean; onOpen?: () => void }) {
  const biz = businessOf(state, slot)
  const fresh = slot.releasedAt && now - slot.releasedAt < JUST_RELEASED

  if (compact) {
    const d = slot.discountPct ?? 0
    return (
      <a href={`#/lc/${slot.id}`} onClick={onOpen} className={`flex items-stretch overflow-hidden rounded-xl border bg-canvas transition hover:shadow-soft ${fresh ? 'border-primary/50' : 'border-hairline'}`}>
        <div className={`relative grid w-20 shrink-0 place-items-center overflow-hidden text-2xl ${CATEGORY_META[biz.category].band}`}>
          {biz.image ? <SiteImage src={biz.image} /> : CATEGORY_META[biz.category].icon}
        </div>
        <div className="min-w-0 flex-1 px-3 py-2.5">
          <p className="truncate font-semibold leading-snug">{slot.title}</p>
          <p className="truncate text-sm text-muted">
            {biz.name} · {biz.neighbourhood}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2 text-sm">
            <span className="text-muted">{when(slot.start, now)}</span>
            <span className="flex items-center gap-1.5 font-semibold">
              {kr(lastCallPrice(slot))}
              {d > 0 && <span className="eyebrow rounded-full bg-primary/10 px-2 py-0.5 text-primary">−{d}%</span>}
            </span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a href={`#/lc/${slot.id}`} className={`group flex flex-col overflow-hidden rounded-xl border bg-canvas transition hover:shadow-soft ${fresh ? 'border-primary/50' : 'border-hairline'}`}>
      <Band category={biz.category} image={biz.image} className="h-28">
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
