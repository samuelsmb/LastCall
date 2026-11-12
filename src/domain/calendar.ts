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

export function openInCalendarApp(slot: Slot, biz: Business) {
  const d = details(slot, biz)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LastCall//NB',
    'BEGIN:VEVENT',
    `UID:${slot.id}@lastcall`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${d.start}`,
    `DTEND:${d.end}`,
    `SUMMARY:${d.title}`,
    `LOCATION:${d.where}`,
    'DESCRIPTION:Bestilt via LastCall',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  // Uten download-attributt åpner Safari/iOS kalenderappen direkte; andre nettlesere laster ned filen.
  window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
