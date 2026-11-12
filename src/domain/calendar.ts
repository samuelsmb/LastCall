import type { Business, Slot } from './types'

const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, '')

function details(slot: Slot, biz: Business) {
  return {
    title: `${slot.title} hos ${biz.name}`,
    where: `${biz.name}, ${biz.address}, ${biz.neighbourhood}, Oslo`,
    start: stamp(slot.start),
    end: stamp(slot.start + slot.durationMin * 60_000),
  }
}

export function googleCalendarUrl(slot: Slot, biz: Business) {
  const d = details(slot, biz)
  const q = new URLSearchParams({ action: 'TEMPLATE', text: d.title, dates: `${d.start}/${d.end}`, location: d.where, details: 'Bestilt via LastCall' })
  return `https://calendar.google.com/calendar/render?${q}`
}

// webcal:// åpner standard kalenderapp (Apple Kalender, Outlook) i stedet for å laste ned en fil.
export function openInCalendarApp(slot: Slot, biz: Business) {
  const d = details(slot, biz)
  const q = new URLSearchParams({ id: slot.id, start: String(slot.start), dur: String(slot.durationMin), title: d.title, where: d.where })
  window.location.href = `webcal://${window.location.host}/api/event?${q}`
}
