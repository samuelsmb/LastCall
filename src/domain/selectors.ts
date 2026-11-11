import type { Business, Category, Slot, State, TimeWindow, Want } from './types'

export function lastCallPrice(slot: Slot) {
  const d = slot.discountPct ?? 0
  if (d === 0) return slot.fullPrice
  return Math.round((slot.fullPrice * (1 - d / 100)) / 5) * 5
}

export function savings(slot: Slot) {
  return slot.fullPrice - lastCallPrice(slot)
}

export function businessOf(state: State, slot: Slot): Business {
  return state.businesses.find((b) => b.id === slot.businessId)!
}

export function isLive(slot: Slot, now: number) {
  return slot.status === 'released' && slot.start > now
}

export function inWindow(start: number, window: TimeWindow, now: number) {
  if (start <= now) return false
  if (window === 'now') return start - now <= 2 * 3_600_000
  if (window === '48h') return start - now <= 48 * 3_600_000
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)
  return start <= endOfToday.getTime()
}

export function matchesWant(state: State, slot: Slot, want: Want, now: number) {
  const biz = businessOf(state, slot)
  return want.categories.includes(biz.category) && inWindow(slot.start, want.window, now)
}

export type SortKey = 'soonest' | 'discount' | 'nearest'

export interface MarketplaceFilters {
  categories: Category[]
  window: TimeWindow | null
  sort: SortKey
}

export function marketplace(state: State, now: number, f: MarketplaceFilters): Slot[] {
  const list = state.slots.filter((s) => {
    if (!isLive(s, now)) return false
    if (f.categories.length && !f.categories.includes(businessOf(state, s).category)) return false
    if (f.window && !inWindow(s.start, f.window, now)) return false
    return true
  })
  const by: Record<SortKey, (a: Slot, b: Slot) => number> = {
    soonest: (a, b) => a.start - b.start,
    discount: (a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0) || a.start - b.start,
    nearest: (a, b) => businessOf(state, a).distanceKm - businessOf(state, b).distanceKm || a.start - b.start,
  }
  return list.sort(by[f.sort])
}

export function releaseTime(state: State, slot: Slot): number | null {
  const rule = state.rules[slot.businessId]
  if (!rule?.enabled) return null
  return slot.start - rule.leadMinutes * 60_000
}

export function dashboardStats(state: State, businessId: string) {
  const base = state.baselines[businessId] ?? { recovered: 0, released: 0, sold: 0 }
  const own = state.slots.filter((s) => s.businessId === businessId)
  const sold = own.filter((s) => s.status === 'sold')
  const released = own.filter((s) => s.releasedAt)
  const recovered = base.recovered + sold.reduce((sum, s) => sum + lastCallPrice(s), 0)
  const releasedCount = base.released + released.length
  const soldCount = base.sold + sold.length
  return {
    recovered,
    released: releasedCount,
    sold: soldCount,
    live: own.filter((s) => s.status === 'released').length,
    sellThrough: releasedCount ? Math.round((soldCount / releasedCount) * 100) : 0,
  }
}

const HINTS: [RegExp, Category][] = [
  [/tyre|tire|car|wash|garage|oil|brake|wheel/i, 'car'],
  [/dinner|dining|food|lunch|brunch|restaurant|eat|table|tasting/i, 'food'],
  [/hair|nail|spa|facial|beauty|manicure|cut|glow/i, 'beauty'],
  [/physio|back|dentist|teeth|massage|doctor|health|knee/i, 'health'],
  [/passport|licen[cs]e|driving test|id card|official|visa/i, 'official'],
  [/bored|fun|kayak|escape|sauna|comedy|experience|date|surprise|adventure/i, 'experiences'],
]

/** Fake "AI": reads a free-text Want and guesses Categories and a time window. */
export function interpretWant(text: string): { categories: Category[]; window: TimeWindow | null } {
  const categories = HINTS.filter(([re]) => re.test(text)).map(([, c]) => c)
  let window: TimeWindow | null = null
  if (/\bnow\b|asap|right away|urgent/i.test(text)) window = 'now'
  else if (/today|tonight|this evening/i.test(text)) window = 'today'
  else if (/48|tomorrow|couple of days|two days|weekend|soon/i.test(text)) window = '48h'
  return { categories: [...new Set(categories)], window }
}
