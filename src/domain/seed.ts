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
  { id: HERO_BUSINESS_ID, name: "Ted's Garage", category: 'car', neighbourhood: 'Valby', address: 'Gammel Køge Landevej 7', distanceKm: 3.2, tagline: 'Tyres, oil and honest advice since 1987' },
  { id: 'lustre', name: 'Lustre Auto Spa', category: 'car', neighbourhood: 'Amager', address: 'Englandsvej 12', distanceKm: 4.8, tagline: 'Hand wash and detailing' },
  { id: 'mosegaard', name: 'Mosegaard', category: 'food', neighbourhood: 'Nørrebro', address: 'Jægersborggade 3', distanceKm: 1.4, tagline: 'Seasonal tasting menu' },
  { id: 'kanal-21', name: 'Kanal 21', category: 'food', neighbourhood: 'Christianshavn', address: 'Overgaden Neden Vandet 21', distanceKm: 2.1, tagline: 'Dinner by the canal' },
  { id: 'schonnemann', name: 'Schønnemann & Daughters', category: 'food', neighbourhood: 'Indre By', address: 'Hauser Plads 16', distanceKm: 0.8, tagline: 'Classic smørrebrød lunch' },
  { id: 'salon-orsted', name: 'Salon Ørsted', category: 'beauty', neighbourhood: 'Frederiksberg', address: 'Gammel Kongevej 44', distanceKm: 1.1, tagline: 'Hair salon' },
  { id: 'hammam', name: 'Hammam Nordique', category: 'beauty', neighbourhood: 'Østerbro', address: 'Strandboulevarden 2', distanceKm: 2.9, tagline: 'Spa and bathhouse' },
  { id: 'maison-manicure', name: 'Maison Manicure', category: 'beauty', neighbourhood: 'Frederiksberg', address: 'Værnedamsvej 5', distanceKm: 2.3, tagline: 'Nail studio' },
  { id: 'kinesis', name: 'Kinesis Physiotherapy', category: 'health', neighbourhood: 'Frederiksberg', address: 'Falkoner Allé 18', distanceKm: 2.6, tagline: 'Physio and sports massage' },
  { id: 'atelier-dentaire', name: 'Atelier Dentaire', category: 'health', neighbourhood: 'Østerbro', address: 'Østerbrogade 101', distanceKm: 3.4, tagline: 'Dental clinic' },
  { id: 'citizen-desk', name: 'Citizen Services', category: 'official', neighbourhood: 'Indre By', address: 'Rådhuspladsen 1', distanceKm: 1.7, tagline: 'Passports, ID and paperwork' },
  { id: 'driving-centre', name: 'Driving Test Centre', category: 'official', neighbourhood: 'Valby', address: 'Retortvej 8', distanceKm: 3.6, tagline: 'Practical driving tests' },
  { id: 'royal-sailing', name: 'Harbour Sailing Club', category: 'experiences', neighbourhood: 'Nyhavn', address: 'Nyhavn 6', distanceKm: 2.0, tagline: 'Sailing trips on the harbour' },
  { id: 'cipher-room', name: 'The Cipher Room', category: 'experiences', neighbourhood: 'Vesterbro', address: 'Istedgade 13', distanceKm: 0.9, tagline: 'Escape rooms' },
  { id: 'badeskib', name: 'Badeskib', category: 'experiences', neighbourhood: 'Holmen', address: 'Holmens Kanal 4', distanceKm: 5.1, tagline: 'Floating sauna' },
  { id: 'kaelder-jazz', name: 'Kælder Jazz Club', category: 'experiences', neighbourhood: 'Indre By', address: 'Store Regnegade 2', distanceKm: 1.3, tagline: 'Live jazz every night' },
]

type LastCallSeed = [businessId: string, title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, discountPct: number, perk?: string]

const lastCalls: LastCallSeed[] = [
  ['mosegaard', 'Tasting menu for two', 'A table for two opened up tonight. Twelve seasonal courses at one of the hardest tables to book in town.', 180, 180, 4200, 35],
  ['kanal-21', 'Five-course dinner for two', 'A canal-side table freed up after a cancellation. Five courses, candlelight, and a great view.', 300, 150, 1600, 40],
  ['schonnemann', 'Lunch for four', 'The window table for four, available for lunch today. Classic smørrebrød and a cold drink.', 40, 90, 720, 30],
  ['salon-orsted', 'Cut and blow-dry', 'A 60-minute appointment with a senior stylist, freed up by a last-minute cancellation.', 55, 60, 650, 40],
  ['hammam', '90-minute spa ritual', 'Steam, scrub and a long soak. Robe and towels included.', 140, 90, 1100, 45],
  ['maison-manicure', 'Gel manicure', 'A 45-minute gel manicure. Long-lasting, no chips.', 1560, 45, 380, 30],
  ['lustre', 'Hand wash and wax', 'A full exterior hand wash and wax. Takes about an hour.', 75, 60, 500, 40],
  ['kinesis', 'Sports physio session', 'A 50-minute session with a sports physiotherapist. Bring that niggle you have been ignoring.', 110, 50, 750, 35],
  ['atelier-dentaire', 'Dental cleaning', 'A 40-minute hygienist appointment.', 1380, 40, 900, 30],
  ['kinesis', 'Deep tissue massage', 'A 60-minute deep tissue massage.', 1800, 60, 800, 25],
  ['citizen-desk', 'Passport appointment', 'Passport appointments usually have a six-week wait. This one is today.', 230, 20, 650, 0, 'Skip the 6-week wait'],
  ['driving-centre', 'Driving test', 'A practical driving test slot. The usual wait is nine weeks; this one is tomorrow.', 1740, 60, 900, 0, 'Skip the 9-week wait'],
  ['royal-sailing', 'Sunset sail for two', 'Two hours on a classic wooden boat with a skipper, sailing past the palaces at sunset.', 240, 120, 700, 40],
  ['cipher-room', 'Escape room for 4–6', 'A 60-minute escape room for a group of four to six.', 170, 60, 1200, 50],
  ['badeskib', 'Private floating sauna for 6', 'Two hours in a wood-fired sauna on the harbour, just for your group. Jump in between rounds.', 1560, 120, 2400, 35],
  ['kaelder-jazz', 'Two front-row seats tonight', 'Front-row seats for tonight’s set at a small cellar jazz club.', 420, 120, 400, 50],
]

type CalendarSeed = [title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, status: Slot['status'], customerName: string, discountPct?: number]

const tedsCalendar: CalendarSeed[] = [
  ['Winter tyre swap', 'Swap to winter tyres, balanced and checked.', 45, 45, 450, 'booked', 'Mette K.'],
  ['Tyre change and balancing', 'Four tyres fitted and balanced while you wait.', 90, 60, 600, 'booked', 'Jonas P.'],
  ['Full service', 'Oil, filters, brakes, fluids and a full check-up.', 165, 120, 1800, 'released', 'Anders B.', 30],
  ['Puncture repair', 'Quick puncture repair.', 240, 30, 300, 'booked', 'Freja L.'],
  ['Oil change', 'New oil and filter.', 360, 40, 700, 'booked', 'Kasper M.'],
  ['Tyre change', 'Four tyres swapped and pressure-checked.', 1320, 45, 450, 'booked', 'Ida S.'],
  ['Brake check', 'Pads, discs and fluid checked.', 1500, 45, 550, 'booked', 'Oliver N.'],
  ['Winter tyre swap', 'Get ready for the frost.', 1620, 45, 450, 'booked', 'Sofie H.'],
  ['Tyre hotel pick-up', 'Collect your stored tyres and have them fitted.', 2760, 30, 250, 'booked', 'Emil R.'],
]

const TEMPLATES: Record<Category, [string, number][]> = {
  food: [['Dinner for two', 900], ["Chef's table for four", 2400], ['Brunch for two', 450]],
  beauty: [['Cut and colour', 1200], ['Facial', 800], ['Manicure', 350]],
  car: [['Tyre change', 450], ['Car wash', 300], ['Service check', 1200]],
  health: [['Physio session', 700], ['60-min massage', 650], ['Check-up', 900]],
  official: [['Passport appointment', 650], ['ID card renewal', 300], ['Driving test', 900]],
  experiences: [['Guided tour', 600], ['Workshop seat', 450], ['Tasting session', 500]],
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
      description: `${title}, synced from your booking system.`,
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
