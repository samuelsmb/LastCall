import { useSyncExternalStore } from 'react'
import { createSeed, generateCalendar, uid } from './seed'
import { matchesWant, releaseTime } from './selectors'
import type { AutoReleaseRule, Category, State, TimeWindow } from './types'

const KEY = 'lastcall-demo-v4'
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

export function cancelSlot(slotId: string) {
  const now = Date.now()
  const slot = state.slots.find((s) => s.id === slotId)
  if (!slot || slot.status !== 'booked') return
  const rule = state.rules[slot.businessId]
  const at = releaseTime(state, slot)
  if (rule?.enabled && at !== null && now >= at) {
    commit(releaseInto(state, slotId, rule.discountPct, now))
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

export function bookSlot(slotId: string, buyerName: string): boolean {
  const slot = state.slots.find((s) => s.id === slotId)
  if (!slot || slot.status !== 'released' || slot.start <= Date.now()) return false
  commit({
    ...state,
    slots: state.slots.map((s) => (s.id === slotId ? { ...s, status: 'sold', buyerName, soldAt: Date.now() } : s)),
  })
  return true
}

export function setRule(businessId: string, patch: Partial<AutoReleaseRule>) {
  const prev = state.rules[businessId] ?? { enabled: false, leadMinutes: 60, discountPct: 30 }
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
    if (at !== null && rule && now >= at) next = releaseInto(next, slot.id, rule.discountPct, now)
  }
  if (next !== state) commit(next)
}

export function addWant(label: string, categories: Category[], window: TimeWindow) {
  commit({ ...state, wants: [{ id: uid('want'), label, categories, window, createdAt: Date.now() }, ...state.wants] })
}

export function removeWant(wantId: string) {
  commit({ ...state, wants: state.wants.filter((w) => w.id !== wantId) })
}

export function markAlertSeen(alertId: string) {
  commit({ ...state, alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, seen: true } : a)) })
}

export function setCurrentBusiness(businessId: string) {
  commit({ ...state, currentBusinessId: businessId })
}

export function registerBusiness(name: string, category: Category, neighbourhood: string) {
  const id = uid('biz')
  const now = Date.now()
  commit({
    ...state,
    businesses: [
      ...state.businesses,
      { id, name, category, neighbourhood, address: `${neighbourhood}`, distanceKm: 1 + Math.round(Math.random() * 40) / 10, tagline: 'New on LastCall' },
    ],
    slots: [...state.slots, ...generateCalendar(id, category, now)],
    rules: { ...state.rules, [id]: { enabled: false, leadMinutes: 60, discountPct: 30 } },
    currentBusinessId: id,
  })
  return id
}
