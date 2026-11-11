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
  { id: HERO_BUSINESS_ID, name: "Ted's Garage", category: 'car', neighbourhood: 'Valby Vibes', address: 'Spark Plug Alley 7', distanceKm: 3.2, emoji: '🛞', tagline: 'Tyres, oil and terrible puns since 1987' },
  { id: 'suds-buds', name: 'Suds & Buds Car Spa', category: 'car', neighbourhood: 'Amagerbrrr', address: 'Bubble Street 12', distanceKm: 4.8, emoji: '🫧', tagline: 'Your car deserves a bubble bath' },
  { id: 'almost-noma', name: 'Almost Noma', category: 'food', neighbourhood: 'Nørrecool', address: 'Moss Lane 3', distanceKm: 1.4, emoji: '🌿', tagline: 'Ants optional. Joy mandatory.' },
  { id: 'hygge-herbs', name: 'Hygge & Herbs', category: 'food', neighbourhood: 'Chillhavn', address: 'Candle Quay 21', distanceKm: 2.1, emoji: '🕯️', tagline: 'Candlelit, cosy, criminally good' },
  { id: 'smorrebrod-society', name: 'Smørrebrød Society', category: 'food', neighbourhood: 'Vesterbrrr', address: 'Rye Road 9', distanceKm: 0.8, emoji: '🥪', tagline: 'Open sandwiches, open hearts' },
  { id: 'the-snippery', name: 'The Snippery', category: 'beauty', neighbourhood: 'Nørrecool', address: 'Fringe Street 44', distanceKm: 1.1, emoji: '✂️', tagline: 'Hair today, gorgeous tomorrow' },
  { id: 'glow-up', name: 'Glow Up Bathhouse', category: 'beauty', neighbourhood: 'Østerbreeze', address: 'Steam Walk 2', distanceKm: 2.9, emoji: '🧖', tagline: 'Sweat, soak, sparkle' },
  { id: 'nail-it', name: 'Nail It Nordic', category: 'beauty', neighbourhood: 'Frostiansberg', address: 'Polish Plads 5', distanceKm: 2.3, emoji: '💅', tagline: 'We nailed it. So will you.' },
  { id: 'bendy-backs', name: 'Bendy Backs Physio', category: 'health', neighbourhood: 'Frostiansberg', address: 'Spine Street 18', distanceKm: 2.6, emoji: '🦴', tagline: 'Unknot your knots' },
  { id: 'smile-factory', name: 'Smile Factory Dental', category: 'health', neighbourhood: 'Østerbreeze', address: 'Floss Boulevard 1', distanceKm: 3.4, emoji: '🦷', tagline: 'Gleam team, assemble' },
  { id: 'citizen-centre', name: 'Cooler Copenhagen Citizen Centre', category: 'official', neighbourhood: 'Rådhus Rink', address: 'Bureaucracy Square 1', distanceKm: 1.7, emoji: '🛂', tagline: 'Paperwork, but make it quick' },
  { id: 'brrrum-test', name: 'Brrrum Driving Test Centre', category: 'official', neighbourhood: 'Valby Vibes', address: 'Parallel Park 8', distanceKm: 3.6, emoji: '🚦', tagline: 'Mirror, signal, celebrate' },
  { id: 'harbour-kayak', name: 'Harbour Kayak Club', category: 'experiences', neighbourhood: 'Chillhavn', address: 'Paddle Pier 6', distanceKm: 2.0, emoji: '🛶', tagline: 'Paddle past the palaces' },
  { id: 'tivolio-escape', name: 'Tivolio Escape Rooms', category: 'experiences', neighbourhood: 'Vesterbrrr', address: 'Riddle Road 13', distanceKm: 0.9, emoji: '🔐', tagline: 'Get locked in. Get out. Get smug.' },
  { id: 'sauna-boat', name: 'Sauna Boat Sundays', category: 'experiences', neighbourhood: 'Amagerbrrr', address: 'Steamy Dock 4', distanceKm: 5.1, emoji: '♨️', tagline: 'Float. Sweat. Jump. Repeat.' },
  { id: 'cellar-comedy', name: 'Cellar Comedy Club', category: 'experiences', neighbourhood: 'Nørrecool', address: 'Punchline Passage 2', distanceKm: 1.3, emoji: '🎤', tagline: 'Front row seats. Brace yourself.' },
]

type LastCallSeed = [businessId: string, title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, discountPct: number, perk?: string]

const lastCalls: LastCallSeed[] = [
  ['almost-noma', '12-course tasting menu for 2', 'A table for two just opened at the most whispered-about counter in Nørrecool. Twelve courses, one sea-buckthorn surprise, zero regrets.', 180, 180, 4200, 35],
  ['hygge-herbs', 'Candlelit 5-course dinner for 2', 'A cancelled anniversary means a candlelit corner by the canal is yours. Bring someone you like.', 300, 150, 1600, 40],
  ['smorrebrod-society', 'Lunch for 4 at the window table', 'The famous window table, four seats, unlimited people-watching. Herring optional.', 40, 90, 720, 30],
  ['the-snippery', 'Cut & blow-dry', 'Someone chickened out of their fringe. Their loss, your glow-up.', 55, 60, 650, 40],
  ['glow-up', '90-min spa ritual', 'Sauna, scrub, soak and a nap in a fluffy robe. Your stress will not be invited.', 140, 90, 1100, 45],
  ['nail-it', 'Gel manicure', 'Glossy, chip-proof and done before your coffee gets cold.', 1560, 45, 380, 30],
  ['suds-buds', 'Deluxe hand wash & wax', 'Your car goes in grumpy, comes out gleaming. Foam party included.', 75, 60, 500, 40],
  ['bendy-backs', 'Sports physio session', 'That niggle you have been ignoring? Today is its last day.', 110, 50, 750, 35],
  ['smile-factory', 'Dental cleaning', 'Six months of coffee, gone in 40 minutes. Floss lecture free of charge.', 1380, 40, 900, 30],
  ['bendy-backs', 'Deep tissue massage', 'Sixty minutes of firm but friendly knot negotiation.', 1800, 60, 800, 25],
  ['citizen-centre', 'Passport appointment', 'Someone found their old passport in a drawer. Their luck becomes yours: skip the 6-week queue.', 230, 20, 650, 0, 'Skip the 6-week queue'],
  ['brrrum-test', 'Driving test slot', 'A freshly freed test slot. Normal wait: 9 weeks. Your wait: until tomorrow.', 1740, 60, 900, 0, 'Skip the 9-week queue'],
  ['harbour-kayak', 'Sunset kayak tour for 2', 'Glide past the harbour as the sky goes pink. Waterproof smiles provided.', 240, 120, 700, 40],
  ['tivolio-escape', 'Escape room for 4-6 people', 'The "Haunted Hygge" room: 60 minutes, one creepy candle, many clues.', 170, 60, 1200, 50],
  ['sauna-boat', 'Private sauna boat (6 people)', 'A wood-fired sauna that floats. Jump in the harbour between rounds, if you dare.', 1560, 120, 2400, 35],
  ['cellar-comedy', '2 front-row seats tonight', 'Sit close enough to become part of the act. Brave souls only.', 420, 120, 400, 50],
]

type CalendarSeed = [title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, status: Slot['status'], customerName: string, discountPct?: number]

const tedsCalendar: CalendarSeed[] = [
  ['Winter tyre swap', 'Swap summer tyres for winter ones, balanced and torqued with love.', 45, 45, 450, 'booked', 'Mette K.'],
  ['Tyre change + balancing', 'Four new tyres fitted and balanced while you enjoy our legendary bad coffee.', 90, 60, 600, 'booked', 'Jonas P.'],
  ['Full service', 'The works: oil, filters, brakes, fluids and a pep talk for your car.', 165, 120, 1800, 'released', 'Anders B.', 30],
  ['Puncture repair', 'Patch it, check it, send you on your way.', 240, 30, 300, 'booked', 'Freja L.'],
  ['Oil change', 'Fresh oil, new filter, happy engine.', 360, 40, 700, 'booked', 'Kasper M.'],
  ['Tyre change', 'Four tyres swapped and pressure-checked.', 1320, 45, 450, 'booked', 'Ida S.'],
  ['Brake check', 'Squeaky brakes? We will find the squeak.', 1500, 45, 550, 'booked', 'Oliver N.'],
  ['Winter tyre swap', 'Get ready for the Cooler Copenhagen frost.', 1620, 45, 450, 'booked', 'Sofie H.'],
  ['Tyre hotel pick-up', 'Collect your stored tyres, fitted on the spot.', 2760, 30, 250, 'booked', 'Emil R.'],
]

const TEMPLATES: Record<Category, [string, number][]> = {
  food: [['Dinner for 2', 900], ["Chef's table for 4", 2400], ['Brunch for 2', 450]],
  beauty: [['Cut & colour', 1200], ['Facial', 800], ['Manicure', 350]],
  car: [['Tyre change', 450], ['Car wash', 300], ['Service check', 1200]],
  health: [['Physio session', 700], ['Massage 60 min', 650], ['Check-up', 900]],
  official: [['Passport appointment', 650], ['ID card renewal', 300], ['Driving test', 900]],
  experiences: [['Group tour', 600], ['Workshop seat', 450], ['Tasting session', 500]],
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
      description: `${title} at a business that just joined LastCall.`,
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
