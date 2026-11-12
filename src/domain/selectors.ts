import { NEIGHBOURHOODS } from './categories'
import { lastCallPrice } from './pricing'
import type { AutoReleaseRule, Business, Category, Slot, State, TimeWindow, Want, WantWindow } from './types'

export { lastCallPrice }

export function savings(slot: Slot) {
  return slot.fullPrice - lastCallPrice(slot)
}

export function businessOf(state: State, slot: Slot): Business {
  return state.businesses.find((b) => b.id === slot.businessId)!
}

export function isLive(slot: Slot, now: number) {
  return slot.status === 'released' && slot.start > now
}

export function inWindow(start: number, window: WantWindow, now: number) {
  if (start <= now) return false
  if (window === 'any') return true
  if (window === 'now') return start - now <= 2 * 3_600_000
  if (window.endsWith('h')) return start - now <= parseFloat(window) * 3_600_000
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)
  return start <= endOfToday.getTime()
}

export function matchesWant(state: State, slot: Slot, want: Want, now: number) {
  if (want.businessId) return slot.businessId === want.businessId && inWindow(slot.start, want.window, now)
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
  return list.sort(slotComparator(state, f.sort))
}

export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'soonest', label: 'Snarest' },
  { value: 'discount', label: 'Størst rabatt' },
  { value: 'nearest', label: 'Nærmest' },
]

export function slotComparator(state: State, sort: SortKey): (a: Slot, b: Slot) => number {
  const by: Record<SortKey, (a: Slot, b: Slot) => number> = {
    soonest: (a, b) => a.start - b.start,
    discount: (a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0) || a.start - b.start,
    nearest: (a, b) => businessOf(state, a).distanceKm - businessOf(state, b).distanceKm || a.start - b.start,
  }
  return by[sort]
}

export function releaseTime(state: State, slot: Slot): number | null {
  const rule = state.rules[slot.businessId]
  if (!rule?.enabled) return null
  if (rule.mode === 'full') return 0
  return slot.start - rule.leadMinutes * 60_000
}

/** The discount an Auto-release rule applies: 0 when it releases at full price. */
export function ruleDiscount(rule: AutoReleaseRule) {
  return rule.mode === 'full' ? 0 : rule.discountPct
}

export const DEFAULT_RULE: AutoReleaseRule = { enabled: false, mode: 'full', leadMinutes: 60, discountPct: 20 }

export function dashboardStats(state: State, businessId: string) {
  const base = state.baselines[businessId] ?? { recovered: 0, released: 0, sold: 0 }
  const own = state.slots.filter((s) => s.businessId === businessId)
  const sold = own.filter((s) => s.status === 'sold')
  const released = own.filter((s) => s.releasedAt)
  const recovered = base.recovered + sold.reduce((sum, s) => sum + lastCallPrice(s), 0)
  const fee = sold.reduce((sum, s) => sum + (s.fee ?? 0), 0)
  const releasedCount = base.released + released.length
  const soldCount = base.sold + sold.length
  return {
    recovered,
    fee,
    net: recovered - fee,
    introSpotsLeft: state.businesses.find((b) => b.id === businessId)?.introSpotsLeft ?? 0,
    released: releasedCount,
    sold: soldCount,
    live: own.filter((s) => s.status === 'released').length,
    sellThrough: releasedCount ? Math.round((soldCount / releasedCount) * 100) : 0,
  }
}

const HINTS: [RegExp, Category][] = [
  [/tyre|tire|car|garage|oil|brake|wheel|dekk|\bbil|verksted|olje|bremse|hjul|punktering/i, 'car'],
  [/dinner|dining|food|lunch|restaurant|eat|table|tasting|menu|middag|\bmat\b|lunsj|spise|bord|smaksmeny|meny/i, 'food'],
  [/hair|nail|spa|massage|massasje|facial|beauty|manicure|haircut|glow|hår|frisør|klipp|negl|ansikt|skjønnhet/i, 'beauty'],
  [/bored|fun|escape|sauna|badstu|jazz|comedy|stand-?up|humor|komikk|komiker|experience|opplevelse|date|surprise|overrask|adventure|kjedet|moro/i, 'experiences'],
]

/** Fake "AI": reads a free-text Want and guesses Categories, a time window and an area. */
export function interpretWant(text: string): { categories: Category[]; window: WantWindow | null; area: string | null } {
  const categories = HINTS.filter(([re]) => re.test(text)).map(([, c]) => c)
  let window: WantWindow | null = null
  if (/\bnow\b|asap|right away|urgent|\bnå\b|med en gang|haster|umiddelbart/i.test(text)) window = 'now'
  else if (/today|tonight|this evening|i dag|idag|i kveld/i.test(text)) window = 'today'
  else if (/48|tomorrow|couple of days|two days|weekend|soon|i morgen|imorgen|to dager|helg|snart/i.test(text)) window = '48h'
  else if (/\b(liker|elsker|følg|følger|når som helst|alltid|gjerne|interessert)\b|\b(love|like|follow|anytime|whenever)\b/i.test(text)) window = 'any'
  const area = NEIGHBOURHOODS.find((n) => text.toLowerCase().includes(n.toLowerCase())) ?? null
  return { categories: [...new Set(categories)], window, area }
}

/** Rough walking time, about 12 minutes per km. */
export function walkMinutes(biz: Business) {
  // Til fots opp til 2 km, ellers bil/kollektiv (ca. 3 min per km)
  return Math.max(1, Math.round(biz.distanceKm <= 2 ? biz.distanceKm * 12 : biz.distanceKm * 3))
}
