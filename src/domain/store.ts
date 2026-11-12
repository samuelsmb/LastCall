import { useSyncExternalStore } from 'react'
import { calculateFee, INTRO_SPOTS } from './pricing'
import { createSeed, DEMO_STOCK, generateCalendar, uid } from './seed'
import { businessOf, DEFAULT_RULE, matchesWant, releaseTime, ruleDiscount } from './selectors'
import type { AutoReleaseRule, Category, ReleaseMode, State, WantWindow } from './types'

const KEY = 'lastcall-demo-v35-nb'
const MAX_AGE = 6 * 3_600_000

function load(): State {
  const now = Date.now()
  if (new URLSearchParams(location.search).has('reset')) {
    localStorage.removeItem(KEY)
    history.replaceState(null, '', location.pathname + location.hash)
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as State
      if (parsed.version === 1 && now - parsed.seededAt < MAX_AGE) return parsed
    }
  } catch {
    // fall through to a fresh seed
  }
  const seed = createSeed(now)
  localStorage.setItem(KEY, JSON.stringify(seed))
  return seed
}

let state: State = load()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function commit(next: State) {
  state = next
  localStorage.setItem(KEY, JSON.stringify(state))
  emit()
}

window.addEventListener('storage', (e) => {
  if (e.key === KEY && e.newValue) {
    state = JSON.parse(e.newValue)
    emit()
  }
})

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function getState() {
  return state
}

export function useAppState() {
  return useSyncExternalStore(subscribe, getState)
}

/* ---------- actions ---------- */

function releaseInto(s: State, slotId: string, discountPct: number, now: number): State {
  const slots = s.slots.map((x) => (x.id === slotId ? { ...x, status: 'released' as const, discountPct, releasedAt: now } : x))
  const released = slots.find((x) => x.id === slotId)!
  const next = { ...s, slots }
  const alerts = s.wants
    .filter((w) => matchesWant(next, released, w, now))
    .map((w) => ({ id: uid('alert'), wantId: w.id, slotId, createdAt: now, seen: false }))
  return { ...next, alerts: [...alerts, ...s.alerts] }
}

/** Demo only: start over with fresh seed data. */
export function resetDemo() {
  commit(createSeed(Date.now()))
}

export function cancelSlot(slotId: string) {
  const now = Date.now()
  const slot = state.slots.find((s) => s.id === slotId)
  if (!slot || slot.status !== 'booked') return
  const rule = state.rules[slot.businessId]
  const at = releaseTime(state, slot)
  if (rule?.enabled && at !== null && now >= at) {
    commit(releaseInto(state, slotId, ruleDiscount(rule), now))
    return
  }
  const status = rule?.enabled ? 'held' : 'cancelled'
  commit({ ...state, slots: state.slots.map((s) => (s.id === slotId ? { ...s, status } : s)) })
}

export function releaseSlot(slotId: string, discountPct: number) {
  const slot = state.slots.find((s) => s.id === slotId)
  if (!slot || (slot.status !== 'cancelled' && slot.status !== 'held')) return
  commit(releaseInto(state, slotId, discountPct, Date.now()))
}

export function withdrawSlot(slotId: string) {
  commit({
    ...state,
    slots: state.slots.map((s) => (s.id === slotId && s.status === 'released' ? { ...s, status: 'cancelled', releasedAt: undefined } : s)),
  })
}

export function bookSlot(slotId: string, buyerName: string, regNumber?: string): boolean {
  const slot = state.slots.find((s) => s.id === slotId)
  if (!slot || slot.status !== 'released' || slot.start <= Date.now()) return false
  const biz = state.businesses.find((b) => b.id === slot.businessId)!
  const { fee, introSpotsUsed } = calculateFee(slot, biz)
  commit({
    ...state,
    businesses: state.businesses.map((b) => (b.id === biz.id ? { ...b, introSpotsLeft: Math.max(0, b.introSpotsLeft - introSpotsUsed) } : b)),
    slots: state.slots.map((s) => (s.id === slotId ? { ...s, status: 'sold', buyerName, regNumber, soldAt: Date.now(), fee, introSpotsUsed } : s)),
  })
  return true
}

export function setRule(businessId: string, patch: Partial<AutoReleaseRule>) {
  const prev = state.rules[businessId] ?? DEFAULT_RULE
  const rule = { ...prev, ...patch }
  let slots = state.slots
  if (prev.enabled !== rule.enabled) {
    slots = slots.map((s) => {
      if (s.businessId !== businessId) return s
      if (!rule.enabled && s.status === 'held') return { ...s, status: 'cancelled' as const }
      if (rule.enabled && s.status === 'cancelled') return { ...s, status: 'held' as const }
      return s
    })
  }
  commit({ ...state, slots, rules: { ...state.rules, [businessId]: rule } })
  applyAutoRelease(Date.now())
}

/** Releases every held Slot whose Auto-release rule time has arrived. */
export function applyAutoRelease(now: number) {
  let next = state
  for (const slot of state.slots) {
    if (slot.status !== 'held' || slot.start <= now) continue
    const at = releaseTime(next, slot)
    const rule = next.rules[slot.businessId]
    if (at !== null && rule && now >= at) next = releaseInto(next, slot.id, ruleDiscount(rule), now)
  }
  if (next !== state) commit(next)
}

export function addWant(label: string, categories: Category[], window: WantWindow, area?: string, businessId?: string) {
  commit({ ...state, wants: [{ id: uid('want'), label, categories, window, area, businessId, createdAt: Date.now() }, ...state.wants] })
  scheduleDemoRelease(label, categories)
}

const DEMO_RELEASE_DELAY = 5_000

/**
 * Demo only: 5 seconds after a Want is saved, release the hidden demo Last Call that matches it,
 * so its Alert fires. If it is already out, it is released again with fresh Alerts, so the demo
 * can be repeated without `?reset`.
 */
export function scheduleDemoRelease(text: string, categories: Category[], tasteProfile = false) {
  const lower = text.toLowerCase()
  const releasable = (id: string) => state.slots.find((s) => s.id === id && (s.status === 'cancelled' || s.status === 'released'))
  const match = DEMO_STOCK.find((d) => {
    const slot = releasable(d.slotId)
    if (!slot || !categories.includes(businessOf(state, slot).category)) return false
    return tasteProfile ? d.tasteProfile : d.topics.some((t) => lower.includes(t))
  })
  if (!match) return
  setTimeout(() => {
    const now = Date.now()
    if (!releasable(match.slotId)) return
    // Starts 90 minutes from release, so it fits every Want window ("now" is within 2 hours).
    const start = Math.ceil((now + 90 * 60_000) / (5 * 60_000)) * (5 * 60_000)
    const moved = {
      ...state,
      slots: state.slots.map((s) => (s.id === match.slotId ? { ...s, start } : s)),
      alerts: state.alerts.filter((a) => a.slotId !== match.slotId),
    }
    commit(releaseInto(moved, match.slotId, match.discountPct, now))
  }, DEMO_RELEASE_DELAY)
}

/** Follow or unfollow a Business: an open-ended Want for its Last Calls only. */
export function toggleFollow(businessId: string) {
  const existing = state.wants.find((w) => w.businessId === businessId)
  if (existing) return removeWant(existing.id)
  const biz = state.businesses.find((b) => b.id === businessId)
  if (biz) addWant(`Nye Last Calls hos ${biz.name}`, [biz.category], 'any', undefined, biz.id)
}

export function removeWant(wantId: string) {
  commit({ ...state, wants: state.wants.filter((w) => w.id !== wantId) })
}

export function markAlertSeen(alertId: string) {
  commit({ ...state, alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, seen: true } : a)) })
}

export function dismissAlertToast(alertId: string) {
  commit({ ...state, alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)) })
}

export function setCurrentBusiness(businessId: string) {
  commit({ ...state, currentBusinessId: businessId })
}

export interface NewBusiness {
  name: string
  category: Category
  neighbourhood: string
  address: string
  tagline: string
  orgNumber?: string
  calendar?: string
  image?: string
  website?: string
  mode: ReleaseMode
}

export function registerBusiness({ mode, ...input }: NewBusiness) {
  const id = uid('biz')
  const now = Date.now()
  commit({
    ...state,
    businesses: [...state.businesses, { id, ...input, distanceKm: 1 + Math.round(Math.random() * 40) / 10, introSpotsLeft: INTRO_SPOTS }],
    slots: [...state.slots, ...generateCalendar(id, input.category, now)],
    rules: { ...state.rules, [id]: { ...DEFAULT_RULE, enabled: true, mode } },
    currentBusinessId: id,
  })
  return id
}
