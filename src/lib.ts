import { useEffect, useState, useSyncExternalStore } from 'react'

/* ---------- ticking clock shared by all countdowns ---------- */

let now = Date.now()
const clockListeners = new Set<() => void>()
setInterval(() => {
  now = Date.now()
  clockListeners.forEach((l) => l())
}, 1000)

export function useNow() {
  return useSyncExternalStore(
    (l) => {
      clockListeners.add(l)
      return () => clockListeners.delete(l)
    },
    () => now,
  )
}

/* ---------- hash router ---------- */

const currentRoute = () => location.hash.replace(/^#/, '') || '/'

export function useRoute() {
  const [route, setRoute] = useState(currentRoute)
  useEffect(() => {
    const onChange = () => {
      setRoute(currentRoute())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function go(path: string) {
  location.hash = path
}

/* ---------- formatting ---------- */

/** NOK, the only currency in the app: `550 kr`, `1 500 kr`. */
export function kr(n: number) {
  return `${Math.round(n).toLocaleString('nb-NO')} kr`.replace(/[\u00a0\u202f]/g, '\u00a0')
}

export function clock(ts: number) {
  return new Date(ts).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
}

export function dayLabel(ts: number, ref: number) {
  const d = new Date(ts)
  const r = new Date(ref)
  const days = Math.round((new Date(d.toDateString()).getTime() - new Date(r.toDateString()).getTime()) / 86_400_000)
  if (days === 0) return 'I dag'
  if (days === 1) return 'I morgen'
  const w = d.toLocaleDateString('nb-NO', { weekday: 'long' })
  return w.charAt(0).toUpperCase() + w.slice(1)
}

export function when(ts: number, ref: number) {
  return `${dayLabel(ts, ref)} ${clock(ts)}`
}

export function countdown(ms: number) {
  if (ms <= 0) return 'startet'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (d > 0) return `${d}d ${h}t`
  if (h > 0) return `${h}t ${m}min`
  return `${m}min ${sec.toString().padStart(2, '0')}s`
}
