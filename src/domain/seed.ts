import type { Business, Category, Slot, State } from './types'

export const HERO_BUSINESS_ID = 'teds-garage'
export const RESTAURANT_ID = 'restaurant-lokka'

/** Fixed ids so every demo step has a stable hash URL. */
export const DEMO_TYRE_SLOT = 'demo-teds-tyre'
export const DEMO_TABLE_SLOT = 'demo-lokka-table'

const MIN = 60_000

/** Start times are relative to app load and snapped to 5 minutes so they always look upcoming. */
function at(now: number, minutesFromNow: number, snap = 5) {
  const t = now + minutesFromNow * MIN
  const step = snap * MIN
  return Math.ceil(t / step) * step
}

/** A fixed clock time, `daysAhead` days from today. */
function onDay(now: number, daysAhead: number, hours: number, minutes = 0) {
  const d = new Date(now)
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

let counter = 0
export function uid(prefix = 'id') {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`
}

const businesses: Business[] = [
  { id: HERO_BUSINESS_ID, name: "Ted's Garage", category: 'car', neighbourhood: 'Majorstuen', address: 'Kirkeveien 64', distanceKm: 0.6, tagline: 'Tyres, oil and honest advice since 1987' },
  { id: 'dekkdoktoren', name: 'Dekkdoktoren', category: 'car', neighbourhood: 'Sagene', address: 'Sandakerveien 24', distanceKm: 2.1, tagline: 'Tyre hotel and wheel swaps' },
  { id: 'wheel-of-fortune', name: 'Wheel of Fortune', category: 'car', neighbourhood: 'Bjørvika', address: 'Dronning Eufemias gate 30', distanceKm: 2.8, tagline: 'Spin in, roll out' },
  { id: RESTAURANT_ID, name: 'Restaurant Løkka', category: 'food', neighbourhood: 'Grünerløkka', address: 'Thorvald Meyers gate 40', distanceKm: 2.4, tagline: 'Nordic tasting menu' },
  { id: 'fjordbord', name: 'Fjordbord', category: 'food', neighbourhood: 'Bjørvika', address: 'Operagata 9', distanceKm: 2.6, tagline: 'Seafood with a fjord view' },
  { id: 'frogner-counter', name: 'The Frogner Counter', category: 'food', neighbourhood: 'Frogner', address: 'Bygdøy allé 18', distanceKm: 1.2, tagline: "Eight seats at the chef's counter" },
  { id: 'hanshaugen-hearth', name: 'Hanshaugen Hearth', category: 'food', neighbourhood: 'St. Hanshaugen', address: 'Ullevålsveien 12', distanceKm: 1.5, tagline: 'New Nordic, cooked over fire' },
  { id: 'salong-sagene', name: 'Salong Sagene', category: 'beauty', neighbourhood: 'Sagene', address: 'Kierschows gate 3', distanceKm: 1.9, tagline: 'Hair salon' },
  { id: 'nailed-it', name: 'Nailed It Frogner', category: 'beauty', neighbourhood: 'Frogner', address: 'Gabels gate 5', distanceKm: 1.4, tagline: 'Nail studio' },
  { id: 'toyen-fysio', name: 'Tøyen Fysio', category: 'health', neighbourhood: 'Tøyen', address: 'Hagegata 22', distanceKm: 2.7, tagline: 'Physio and sports massage' },
  { id: 'smile-majorstuen', name: 'Smile Majorstuen', category: 'health', neighbourhood: 'Majorstuen', address: 'Bogstadveien 51', distanceKm: 0.4, tagline: 'Dental clinic' },
  { id: 'passport-office', name: 'Passport Office', category: 'official', neighbourhood: 'Gamle Oslo', address: 'Grønlandsleiret 44', distanceKm: 3.0, tagline: 'Passports and national ID cards' },
  { id: 'driving-test', name: 'Driving Test Centre', category: 'official', neighbourhood: 'Gamle Oslo', address: 'Kjelsåsveien 1', distanceKm: 3.4, tagline: 'Practical driving tests' },
  { id: 'brrrjorvika', name: 'Brrrjørvika Sauna Raft', category: 'experiences', neighbourhood: 'Bjørvika', address: 'Langkaia 1', distanceKm: 2.5, tagline: 'Wood-fired sauna, fjord plunge included' },
  { id: 'cellar-jazz', name: 'Cellar Jazz Club', category: 'experiences', neighbourhood: 'St. Hanshaugen', address: 'Waldemar Thranes gate 8', distanceKm: 1.7, tagline: 'Live jazz every night' },
  { id: 'escape-toyen', name: 'Escape Tøyen', category: 'experiences', neighbourhood: 'Tøyen', address: 'Kolstadgata 1', distanceKm: 2.9, tagline: 'Escape rooms' },
]

type LastCallSeed = [businessId: string, title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, discountPct: number, guests?: number, perk?: string]

const lastCalls: LastCallSeed[] = [
  [RESTAURANT_ID, 'Tasting menu, table for 2', 'A table for two opened up. Twelve Nordic courses at one of the hardest tables to book in Grünerløkka.', 200, 180, 3900, 20, 2],
  ['fjordbord', 'Seafood menu, table for 4', 'A table for four by the window freed up after a cancellation. Shellfish, fjord view, candlelight.', 300, 150, 6000, 25, 4],
  ['frogner-counter', "Chef's counter for 2", "Two of the eight counter seats, usually booked out for weeks. Full price, but you're in.", 1560, 180, 7000, 0, 2],
  ['hanshaugen-hearth', 'Six courses, table for 2', 'Six courses cooked over fire. A table for two came free tonight.', 420, 150, 3300, 15, 2],
  [RESTAURANT_ID, 'Late seating, table for 4', 'A late table for four tomorrow evening.', 1500, 150, 6400, 20, 4],
  ['dekkdoktoren', 'Tyre change', 'Four wheels swapped and pressure-checked. Garages are fully booked in tyre season, so this is a rare one.', 95, 30, 550, 0],
  ['wheel-of-fortune', 'Tyre change and balancing', 'Wheels swapped and balanced while you wait. Coffee included.', 200, 45, 700, 0],
  ['dekkdoktoren', 'Tyre change', 'Four wheels swapped. Bring your own set or pick up from the tyre hotel.', 1380, 30, 450, 10],
  ['wheel-of-fortune', 'Tyre change', 'Wheels swapped, nuts torqued, done in half an hour.', 1700, 30, 600, 0],
  ['salong-sagene', 'Cut and blow-dry', 'A 60-minute appointment with a senior stylist, freed up by a last-minute cancellation.', 55, 60, 890, 30],
  ['nailed-it', 'Gel manicure', 'A 45-minute gel manicure. Long-lasting, no chips.', 1560, 45, 650, 25],
  ['toyen-fysio', 'Sports physio session', 'A 50-minute session with a sports physiotherapist. Bring that niggle you have been ignoring.', 110, 50, 750, 0],
  ['smile-majorstuen', 'Dental cleaning', 'A 40-minute hygienist appointment.', 1380, 40, 1100, 20],
  ['passport-office', 'Passport appointment', 'Passport appointments usually have a six-week wait. This one is today.', 230, 20, 0, 0, undefined, 'Skip the 6-week wait'],
  ['brrrjorvika', 'Private sauna for 6', 'Two hours in a wood-fired sauna on the fjord, just for your group. Jump in between rounds.', 240, 120, 1800, 30],
  ['cellar-jazz', 'Two front-row seats tonight', 'Front-row seats for tonight’s set at a small cellar jazz club.', 420, 120, 590, 40],
]

type CalendarSeed = { title: string; description: string; start: number; durationMin: number; fullPrice: number; status: Slot['status']; customerName: string; discountPct?: number; guests?: number; id?: string }

function tedsCalendar(now: number): CalendarSeed[] {
  return [
    { title: 'Tyre change', description: 'Four wheels swapped and pressure-checked.', start: at(now, 45, 15), durationMin: 30, fullPrice: 550, status: 'booked', customerName: 'Ingrid H.' },
    { title: 'Tyre change and balancing', description: 'Four wheels swapped and balanced while you wait.', start: at(now, 90, 15), durationMin: 45, fullPrice: 700, status: 'booked', customerName: 'Lars B.' },
    { title: 'Full service', description: 'Oil, filters, brakes, fluids and a full check-up.', start: at(now, 165, 15), durationMin: 120, fullPrice: 2900, status: 'released', customerName: 'Anders B.', discountPct: 0 },
    { title: 'Puncture repair', description: 'Quick puncture repair.', start: at(now, 240, 15), durationMin: 30, fullPrice: 450, status: 'booked', customerName: 'Sigrid L.' },
    { title: 'Tyre change', description: 'Four wheels swapped and pressure-checked.', start: at(now, 360, 15), durationMin: 30, fullPrice: 550, status: 'booked', customerName: 'Magnus E.' },
    { id: DEMO_TYRE_SLOT, title: 'Tyre change', description: 'Four wheels swapped and pressure-checked, done in half an hour.', start: onDay(now, 1, 14), durationMin: 30, fullPrice: 550, status: 'booked', customerName: 'Mette K.' },
    { title: 'Brake check', description: 'Pads, discs and fluid checked.', start: onDay(now, 1, 10, 30), durationMin: 45, fullPrice: 650, status: 'booked', customerName: 'Oliver N.' },
    { title: 'Tyre change', description: 'Four wheels swapped and pressure-checked.', start: onDay(now, 1, 16), durationMin: 30, fullPrice: 550, status: 'booked', customerName: 'Sofie H.' },
    { title: 'Tyre hotel pick-up', description: 'Collect your stored tyres and have them fitted.', start: onDay(now, 2, 9), durationMin: 30, fullPrice: 600, status: 'booked', customerName: 'Emil R.' },
  ]
}

function lokkaCalendar(now: number): CalendarSeed[] {
  // "Tonight 19:30" for the demo; if it's already too late today, the same table tomorrow.
  const tonight = onDay(now, 0, 19, 30)
  const tableStart = tonight - now > 45 * MIN ? tonight : onDay(now, 1, 19, 30)
  return [
    { title: 'Table for 4', description: 'Tasting menu, four guests.', start: at(now, 120, 15), durationMin: 180, fullPrice: 7800, status: 'booked', customerName: 'Nora V.', guests: 4 },
    { id: DEMO_TABLE_SLOT, title: 'Table for 2', description: 'Twelve-course Nordic tasting menu for two.', start: tableStart, durationMin: 180, fullPrice: 4000, status: 'booked', customerName: 'Henrik S.', guests: 2 },
    { title: 'Table for 2', description: 'Tasting menu, two guests.', start: tableStart + 60 * MIN, durationMin: 180, fullPrice: 4000, status: 'booked', customerName: 'Maja T.', guests: 2 },
    { title: 'Table for 4', description: 'Tasting menu, four guests.', start: onDay(now, 1, 18), durationMin: 180, fullPrice: 7800, status: 'booked', customerName: 'Erik P.', guests: 4 },
    { title: 'Table for 2', description: 'Tasting menu, two guests.', start: onDay(now, 1, 20), durationMin: 180, fullPrice: 3900, status: 'booked', customerName: 'Kari N.', guests: 2 },
  ]
}

const TEMPLATES: Record<Category, [title: string, price: number, guests?: number][]> = {
  food: [['Table for 2', 3600, 2], ['Table for 4', 7000, 4], ['Table for 2', 3000, 2]],
  beauty: [['Cut and colour', 1600], ['Facial', 1100], ['Manicure', 550]],
  car: [['Tyre change', 550], ['Tyre change and balancing', 700], ['Service check', 1800]],
  health: [['Physio session', 750], ['60-min massage', 900], ['Check-up', 1100]],
  official: [['Passport appointment', 0], ['ID card renewal', 0], ['Driving test', 1300]],
  experiences: [['Guided tour', 450], ['Workshop seat', 650], ['Tasting session', 750]],
}

const CUSTOMER_NAMES = ['Mette K.', 'Lars B.', 'Sigrid L.', 'Magnus E.', 'Ingrid H.', 'Oliver N.', 'Sofie H.', 'Emil R.']

/** Generates a believable calendar for a newly registered Business. */
export function generateCalendar(businessId: string, category: Category, now: number): Slot[] {
  const offsets = [50, 110, 200, 320, 1380, 1500, 1680, 2700]
  return offsets.map((m, i) => {
    const [title, fullPrice, guests] = TEMPLATES[category][i % 3]
    return {
      id: uid('slot'),
      businessId,
      title,
      description: `${title}, synced from your booking system.`,
      start: at(now, m, 15),
      durationMin: 60,
      fullPrice,
      guests,
      status: 'booked',
      customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
    }
  })
}

function calendarSlots(businessId: string, entries: CalendarSeed[], now: number): Slot[] {
  return entries.map(({ id, ...e }) => ({
    ...e,
    id: id ?? uid('slot'),
    businessId,
    releasedAt: e.status === 'released' ? now - 20 * MIN : undefined,
  }))
}

export function createSeed(now: number): State {
  const slots: Slot[] = []

  for (const [businessId, title, description, m, durationMin, fullPrice, discountPct, guests, perk] of lastCalls) {
    slots.push({
      id: uid('slot'),
      businessId,
      title,
      description,
      start: at(now, m),
      durationMin,
      fullPrice,
      guests,
      status: 'released',
      discountPct,
      releasedAt: now - (10 + Math.floor(Math.random() * 120)) * MIN,
      perk,
    })
  }

  slots.push(...calendarSlots(HERO_BUSINESS_ID, tedsCalendar(now), now), ...calendarSlots(RESTAURANT_ID, lokkaCalendar(now), now))

  return {
    version: 1,
    seededAt: now,
    businesses,
    slots,
    rules: {
      [HERO_BUSINESS_ID]: { enabled: true, mode: 'full', leadMinutes: 60, discountPct: 20 },
      [RESTAURANT_ID]: { enabled: true, mode: 'discount', leadMinutes: 120, discountPct: 20 },
    },
    baselines: {},
    wants: [],
    alerts: [],
    currentBusinessId: HERO_BUSINESS_ID,
  }
}
