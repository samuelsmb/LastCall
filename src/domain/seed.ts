import type { Business, Category, Slot, State } from './types'

export const HERO_BUSINESS_ID = 'teds-garage'

const MIN = 60_000

/** Start times are relative to app load and snapped to 5 minutes so they always look upcoming. */
function at(now: number, minutesFromNow: number, snap = 5) {
  const t = now + minutesFromNow * MIN
  const step = snap * MIN
  return Math.ceil(t / step) * step
}

let counter = 0
export function uid(prefix = 'id') {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`
}

const businesses: Business[] = [
  { id: HERO_BUSINESS_ID, name: "Ted's Garage", category: 'car', neighbourhood: 'Valby', address: 'Gammel Køge Landevej 7', distanceKm: 3.2, tagline: 'Tyre and coachwork service since 1987' },
  { id: 'lustre', name: 'Lustre Auto Spa', category: 'car', neighbourhood: 'Amager', address: 'Englandsvej 12', distanceKm: 4.8, tagline: 'Hand-finished detailing for the discerning motorist' },
  { id: 'mosegaard', name: 'Mosegaard', category: 'food', neighbourhood: 'Nørrebro', address: 'Jægersborggade 3', distanceKm: 1.4, tagline: 'Two stars. One counter. No compromises.' },
  { id: 'kanal-21', name: 'Kanal 21', category: 'food', neighbourhood: 'Christianshavn', address: 'Overgaden Neden Vandet 21', distanceKm: 2.1, tagline: 'Candlelit dining on the canal' },
  { id: 'schonnemann', name: 'Schønnemann & Daughters', category: 'food', neighbourhood: 'Indre By', address: 'Hauser Plads 16', distanceKm: 0.8, tagline: 'Smørrebrød, as it was always meant to be' },
  { id: 'salon-orsted', name: 'Salon Ørsted', category: 'beauty', neighbourhood: 'Frederiksberg', address: 'Gammel Kongevej 44', distanceKm: 1.1, tagline: 'Cut, colour and quiet confidence' },
  { id: 'hammam', name: 'Hammam Nordique', category: 'beauty', neighbourhood: 'Østerbro', address: 'Strandboulevarden 2', distanceKm: 2.9, tagline: 'Ritual bathing in the Nordic manner' },
  { id: 'maison-manicure', name: 'Maison Manicure', category: 'beauty', neighbourhood: 'Frederiksberg', address: 'Værnedamsvej 5', distanceKm: 2.3, tagline: 'Hands, properly attended to' },
  { id: 'kinesis', name: 'Kinesis Physiotherapy', category: 'health', neighbourhood: 'Frederiksberg', address: 'Falkoner Allé 18', distanceKm: 2.6, tagline: 'Sports medicine for the serious amateur' },
  { id: 'atelier-dentaire', name: 'Atelier Dentaire', category: 'health', neighbourhood: 'Østerbro', address: 'Østerbrogade 101', distanceKm: 3.4, tagline: 'Discreet dentistry' },
  { id: 'citizen-desk', name: 'Citizen Services Priority Desk', category: 'official', neighbourhood: 'Indre By', address: 'Rådhuspladsen 1', distanceKm: 1.7, tagline: 'Paperwork, without the queue' },
  { id: 'driving-centre', name: 'National Driving Test Centre', category: 'official', neighbourhood: 'Valby', address: 'Retortvej 8', distanceKm: 3.6, tagline: 'Examination slots, rarely released' },
  { id: 'royal-sailing', name: 'Royal Harbour Sailing Club', category: 'experiences', neighbourhood: 'Nyhavn', address: 'Nyhavn 6', distanceKm: 2.0, tagline: 'Evening sails past the palaces' },
  { id: 'cipher-room', name: 'The Cipher Room', category: 'experiences', neighbourhood: 'Vesterbro', address: 'Istedgade 13', distanceKm: 0.9, tagline: 'An intellectual pursuit, under lock and key' },
  { id: 'badeskib', name: 'Badeskib', category: 'experiences', neighbourhood: 'Holmen', address: 'Holmens Kanal 4', distanceKm: 5.1, tagline: 'A wood-fired sauna, afloat' },
  { id: 'kaelder-jazz', name: 'Kælder Jazz Club', category: 'experiences', neighbourhood: 'Indre By', address: 'Store Regnegade 2', distanceKm: 1.3, tagline: 'Front-row seats, by quiet arrangement' },
]

type LastCallSeed = [businessId: string, title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, discountPct: number, perk?: string]

const lastCalls: LastCallSeed[] = [
  ['mosegaard', 'Twelve-course tasting menu for two', 'A counter seat at the most discussed table in the city has, regrettably for someone, become available. Wine pairing is recommended and, frankly, expected.', 180, 180, 4200, 35],
  ['kanal-21', 'Five-course dinner for two', 'A cancelled anniversary leaves the canal-side corner table unclaimed. Candlelight, linen, and a sommelier who remembers names.', 300, 150, 1600, 40],
  ['schonnemann', 'Luncheon for four, window table', 'The window table, rarely offered, with aquavit service. Herring, naturally.', 40, 90, 720, 30],
  ['salon-orsted', 'Cut and blow-dry with the creative director', 'An hour with the creative director, released by a client who could not make it. Their loss is evident.', 55, 60, 650, 40],
  ['hammam', 'Ninety-minute signature ritual', 'Steam, scrub, soak and a period of considered stillness in a robe of exceptional thread count.', 140, 90, 1100, 45],
  ['maison-manicure', 'Signature gel manicure', 'Precise, unhurried, impeccable. The way hands ought to be treated.', 1560, 45, 380, 30],
  ['lustre', 'Hand wash and ceramic wax', 'Your motor car, restored to showroom lustre by people who care rather more than is reasonable.', 75, 60, 500, 40],
  ['kinesis', 'Sports physiotherapy consultation', 'A consultation with the clinic lead. Bring the niggle you have been too busy to address.', 110, 50, 750, 35],
  ['atelier-dentaire', 'Hygienist appointment', 'Forty minutes of quiet, meticulous attention. The lecture on flossing is complimentary.', 1380, 40, 900, 30],
  ['kinesis', 'Deep tissue massage', 'Sixty minutes of firm, expert negotiation with your shoulders.', 1800, 60, 800, 25],
  ['citizen-desk', 'Passport appointment', 'An appointment ordinarily requiring a six-week wait, now available this afternoon. Some things simply should not involve queueing.', 230, 20, 650, 0, 'Bypass the six-week wait'],
  ['driving-centre', 'Practical driving examination', 'A freshly released examination slot. The usual wait is nine weeks. Yours is until tomorrow.', 1740, 60, 900, 0, 'Bypass the nine-week wait'],
  ['royal-sailing', 'Private sunset sail for two', 'A classic wooden yacht, a skipper, a bottle of something cold, and the palaces in evening light.', 240, 120, 700, 40],
  ['cipher-room', 'Private puzzle salon for four to six', 'Sixty minutes, one locked library, and a series of riddles beneath your intellect, surely.', 170, 60, 1200, 50],
  ['badeskib', 'Private floating sauna for six', 'A wood-fired sauna on the harbour, entirely yours. Bracing dips between rounds, should you be so inclined.', 1560, 120, 2400, 35],
  ['kaelder-jazz', 'Two front-row seats this evening', 'The trio, the cellar, the front row. An evening one mentions at dinner parties for months.', 420, 120, 400, 50],
]

type CalendarSeed = [title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, status: Slot['status'], customerName: string, discountPct?: number]

const tedsCalendar: CalendarSeed[] = [
  ['Winter tyre exchange', 'Seasonal tyre exchange, balanced and torqued to specification.', 45, 45, 450, 'booked', 'Mette K.'],
  ['Tyre fitting and balancing', 'Four tyres fitted and balanced while you wait in the lounge.', 90, 60, 600, 'booked', 'Jonas P.'],
  ['Full service', 'Oil, filters, brakes, fluids, and a thorough inspection.', 165, 120, 1800, 'released', 'Anders B.', 30],
  ['Puncture repair', 'Swift, discreet and properly done.', 240, 30, 300, 'booked', 'Freja L.'],
  ['Oil change', 'Fresh oil and filter, to manufacturer specification.', 360, 40, 700, 'booked', 'Kasper M.'],
  ['Tyre fitting', 'Four tyres exchanged and pressure-checked.', 1320, 45, 450, 'booked', 'Ida S.'],
  ['Brake inspection', 'A careful inspection of pads, discs and fluid.', 1500, 45, 550, 'booked', 'Oliver N.'],
  ['Winter tyre exchange', 'Prepared for the Cooler Copenhagen frost.', 1620, 45, 450, 'booked', 'Sofie H.'],
  ['Tyre hotel collection', 'Your stored tyres, retrieved and fitted.', 2760, 30, 250, 'booked', 'Emil R.'],
]

const TEMPLATES: Record<Category, [string, number][]> = {
  food: [['Dinner for two', 900], ["Chef's table for four", 2400], ['Brunch for two', 450]],
  beauty: [['Cut and colour', 1200], ['Signature facial', 800], ['Manicure', 350]],
  car: [['Tyre fitting', 450], ['Hand wash', 300], ['Service inspection', 1200]],
  health: [['Physiotherapy session', 700], ['Massage, sixty minutes', 650], ['Consultation', 900]],
  official: [['Passport appointment', 650], ['ID card renewal', 300], ['Driving examination', 900]],
  experiences: [['Private tour', 600], ['Masterclass seat', 450], ['Tasting session', 500]],
}

const CUSTOMER_NAMES = ['Mette K.', 'Jonas P.', 'Freja L.', 'Kasper M.', 'Ida S.', 'Oliver N.', 'Sofie H.', 'Emil R.']

/** Generates a believable calendar for a newly registered Business. */
export function generateCalendar(businessId: string, category: Category, now: number): Slot[] {
  const offsets = [50, 110, 200, 320, 1380, 1500, 1680, 2700]
  return offsets.map((m, i) => {
    const [title, fullPrice] = TEMPLATES[category][i % 3]
    return {
      id: uid('slot'),
      businessId,
      title,
      description: `${title}, imported from your existing reservations system.`,
      start: at(now, m, 15),
      durationMin: 60,
      fullPrice,
      status: 'booked',
      customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
    }
  })
}

export function createSeed(now: number): State {
  const slots: Slot[] = []

  for (const [businessId, title, description, m, durationMin, fullPrice, discountPct, perk] of lastCalls) {
    slots.push({
      id: uid('slot'),
      businessId,
      title,
      description,
      start: at(now, m),
      durationMin,
      fullPrice,
      status: 'released',
      discountPct,
      releasedAt: now - (10 + Math.floor(Math.random() * 120)) * MIN,
      perk,
    })
  }

  for (const [title, description, m, durationMin, fullPrice, status, customerName, discountPct] of tedsCalendar) {
    slots.push({
      id: uid('slot'),
      businessId: HERO_BUSINESS_ID,
      title,
      description,
      start: at(now, m, 15),
      durationMin,
      fullPrice,
      status,
      customerName,
      discountPct,
      releasedAt: status === 'released' ? now - 20 * MIN : undefined,
    })
  }

  return {
    version: 1,
    seededAt: now,
    businesses,
    slots,
    rules: {
      [HERO_BUSINESS_ID]: { enabled: true, leadMinutes: 60, discountPct: 30 },
    },
    baselines: {
      [HERO_BUSINESS_ID]: { recovered: 14350, released: 23, sold: 19 },
    },
    wants: [],
    alerts: [],
    currentBusinessId: HERO_BUSINESS_ID,
  }
}
