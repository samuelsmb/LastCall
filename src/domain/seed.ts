import { INTRO_SPOTS } from './pricing'
import type { Baseline, Business, Category, Slot, State } from './types'

export const HERO_BUSINESS_ID = 'teds-garage'
export const RESTAURANT_ID = 'restaurant-lokka'

/** Fixed ids so every demo step has a stable hash URL. */
export const DEMO_TYRE_SLOT = 'demo-teds-tyre'
export const DEMO_TABLE_SLOT = 'demo-lokka-table'

/**
 * Hidden demo Last Calls: cancelled and invisible until a Customer saves a Want that matches
 * one of the topic words (or a Taste-profile Want, for `tasteProfile`). Then it is released.
 */
export const DEMO_STOCK: { slotId: string; topics: string[]; tasteProfile?: boolean; discountPct: number }[] = [
  { slotId: 'demo-comedy-latter', topics: ['comedy', 'standup', 'stand-up', 'humor', 'komedi', 'komikk', 'komiker', 'latter', 'morsom'], discountPct: 30 },
  { slotId: 'demo-jazz-concert', topics: ['jazz'], tasteProfile: true, discountPct: 30 },
]

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

const businesses: Omit<Business, 'introSpotsLeft'>[] = [
  { id: HERO_BUSINESS_ID, name: 'Mekonomen', category: 'car', neighbourhood: 'Alna', address: 'Smalvollveien', distanceKm: 5.8, tagline: 'Verksted for dekkskift og service', image: 'https://www.mekonomen.no/wp-content/uploads/2025/02/Bilverksted.jpg' },
  { id: 'wheel-of-fortune', name: 'Snap Drive', category: 'car', neighbourhood: 'Rødtvet', address: 'Kakkelovnskroken', distanceKm: 8.0, tagline: 'Dekkskift og bilservice', image: 'https://www.snapdrive.no/getfile.php/132642-1789757416/Bilder/Artikkelbilder/Artikler/H%C3%B8stklar%20bil.jpg%20%28content%29.webp' },
  { id: RESTAURANT_ID, name: 'Theatercaféen', category: 'food', neighbourhood: 'Sentrum', address: 'Stortingsgata 24', distanceKm: 0.2, tagline: 'Klassisk wienerkafé siden 1900', image: 'img/theatercafeen.jpg' },
  { id: 'fjordbord', name: 'Katla', category: 'food', neighbourhood: 'Sentrum', address: 'Kristian Augusts gate', distanceKm: 0.6, tagline: 'Nordiske råvarer og smaker fra Asia og Latin-Amerika, tilberedt på åpen flamme', image: 'https://static1.squarespace.com/static/5ecb7d5ad83f90785cbcd987/t/5ecb8619a81cd4417d9828ad/1748945520074/Katla-restaurant-Atli-retter_lower_res.jpg?format=1500w' },
  { id: 'frogner-counter', name: 'Statholdergaarden', category: 'food', neighbourhood: 'Sentrum', address: 'Rådhusgata 11', distanceKm: 0.6, tagline: 'Gourmetrestaurant med Michelin-stjerne siden 1998', image: 'img/statholdergaarden.jpg' },
  { id: 'hanshaugen-hearth', name: 'Statholderens Mat & Vinkjeller', category: 'food', neighbourhood: 'Sentrum', address: 'Rådhusgata 11', distanceKm: 0.6, tagline: 'Moderne bistro med sesongmenyer', image: 'img/statholdergaarden.jpg' },
  { id: 'hope-posthallen', name: 'Hope Posthallen', category: 'beauty', neighbourhood: 'Sentrum', address: 'Prinsens gate 10', distanceKm: 0.5, tagline: 'Frisør i hjertet av byen', image: 'img/posthallen.jpg' },
  { id: 'bristol-spa', name: 'Bristol Spa', category: 'beauty', neighbourhood: 'Sentrum', address: 'Kristian IVs gate 7', distanceKm: 0.2, tagline: 'Spa med basseng, sauna og massasje på Hotel Bristol', image: 'img/massasje.jpg' },
  { id: 'adam-og-eva', name: 'Adam og Eva', category: 'beauty', neighbourhood: 'Sentrum', address: 'Schweigaards gate 14', distanceKm: 1.1, tagline: 'Frisørsalong i Oslo sentrum', image: 'https://adamogeva.no/wp-content/uploads/2024/10/Salong-2-scaled.jpg' },
  { id: 'studio-johnny', name: 'Studio Johnny', category: 'beauty', neighbourhood: 'Sentrum', address: 'Jernbanetorget 1', distanceKm: 0.5, tagline: 'Frisørsalong med kreativ touch', image: 'img/frisor1.jpg' },
  { id: 'bel-etage', name: 'Bel Etage', category: 'beauty', neighbourhood: 'Sentrum', address: 'Tollbugata 27', distanceKm: 0.8, tagline: 'Eksklusiv frisørsalong', image: 'img/frisor2.jpg' },
  { id: 'kok-langkaia', name: 'KOK Badstue', category: 'beauty', neighbourhood: 'Bjørvika', address: 'Langkaia', distanceKm: 1.3, tagline: 'Badstue og sjøbad ved fjorden', image: 'https://koknorge.no/wp-content/uploads/2023/12/Fellesskap.jpg' },
  { id: 'cellar-jazz', name: 'Herr Nilsen', category: 'experiences', neighbourhood: 'Sentrum', address: 'C.J. Hambros plass 5', distanceKm: 0.4, tagline: 'Live jazz hver kveld', image: 'img/herr-nilsen.jpg' },
  { id: 'latter', name: 'Latter', category: 'experiences', neighbourhood: 'Aker Brygge', address: 'Stranden 3', distanceKm: 1.2, tagline: 'Oslos største standupscene' },
]

/**
 * Month-to-date history per Business, so dashboards don't start at 0 kr. Sized to each trade:
 * restaurants sell fewer but pricier tables, salons and garages many smaller appointments,
 * experiences cheap tickets with high sell-through. Fees are 49 kr per spot, capped at 10%.
 */
const BASELINES: Record<string, Baseline> = {
  [HERO_BUSINESS_ID]: { recovered: 26_450, released: 27, sold: 23, fee: 1_127 },
  'wheel-of-fortune': { recovered: 13_900, released: 19, sold: 14, fee: 686 },
  [RESTAURANT_ID]: { recovered: 31_280, released: 21, sold: 17, fee: 2_058 },
  fjordbord: { recovered: 27_060, released: 15, sold: 11, fee: 1_470 },
  'frogner-counter': { recovered: 25_800, released: 6, sold: 6, fee: 588 },
  'hanshaugen-hearth': { recovered: 14_220, released: 13, sold: 9, fee: 1_078 },
  'hope-posthallen': { recovered: 25_650, released: 24, sold: 19, fee: 931 },
  'bristol-spa': { recovered: 13_500, released: 16, sold: 12, fee: 588 },
  'adam-og-eva': { recovered: 10_080, released: 22, sold: 16, fee: 784 },
  'studio-johnny': { recovered: 11_960, released: 18, sold: 13, fee: 637 },
  'bel-etage': { recovered: 14_400, released: 13, sold: 8, fee: 392 },
  'kok-langkaia': { recovered: 19_740, released: 25, sold: 21, fee: 1_715 },
  'cellar-jazz': { recovered: 9_620, released: 34, sold: 26, fee: 962 },
  latter: { recovered: 8_460, released: 22, sold: 18, fee: 846 },
}

type LastCallSeed = [businessId: string, title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, discountPct: number, guests?: number, perk?: string]

const lastCalls: LastCallSeed[] = [
  [RESTAURANT_ID, 'Middag, bord for 2', 'Et bord for to ble ledig. Klassisk wienerkjøkken i et av byens mest kjente kafélokaler.', 200, 120, 1600, 20, 2],
  ['fjordbord', 'Smaksmeny, bord for 4', 'Et bord for fire ble ledig etter en avbestilling.', 300, 150, 4400, 25, 4],
  ['frogner-counter', 'Middag for 2', 'To av åtte plasser ved kjøkkenet, vanligvis fullbooket i ukevis. Full pris, men du kommer inn.', 1560, 180, 4800, 0, 2],
  ['hanshaugen-hearth', 'Smaksmeny, bord for 2', 'Et bord for to ble ledig i kveld. Sesongmeny i den uformelle bistroen under Statholdergaarden.', 420, 150, 1600, 15, 2],
  [RESTAURANT_ID, 'Middag, bord for 4', 'Et bord for fire i morgen kveld.', 1500, 150, 3200, 20, 4],
  ['wheel-of-fortune', 'Dekkskift og balansering', 'Hjulene byttes og balanseres mens du venter. Kaffe inkludert.', 200, 45, 1100, 0],
  ['wheel-of-fortune', 'Dekkskift', 'Hjul byttet, mutrene strammet, ferdig på en halvtime.', 1700, 30, 850, 0],
  [RESTAURANT_ID, 'Middag, bord for 2', 'Et bord for to i morgen kveld, frigitt etter en avbestilling.', 1580, 120, 1700, 0, 2, 'Hopp over køen'],
  ['fjordbord', 'Smaksmeny, bord for 2', 'To plasser ledig i kveld.', 160, 120, 2200, 20, 2],
  ['frogner-counter', 'Middag for 2, i morgen', 'Middag ved kjøkkenet i morgen kveld. Seks retter servert foran deg.', 1620, 150, 3900, 10, 2],
  ['hanshaugen-hearth', 'Bord for 4', 'Et bord for fire, ledig i morgen kveld.', 1440, 150, 3200, 20, 4],
  ['wheel-of-fortune', 'Dekkskift, SUV og varebil', 'Større hjul, samme raske service. Hjulene balanseres og mutrene strammes.', 150, 45, 1300, 10],
  ['wheel-of-fortune', 'Dekkskift, i morgen tidlig', 'Første time i morgen, før jobb.', 1260, 30, 800, 0],
  ['kok-langkaia', 'Privat badstu for 6', 'To timer i badstu ved fjorden, kun for gruppen din, med sjøbad mellom øktene.', 240, 120, 2800, 30],
  ['kok-langkaia', 'Felles badstuøkt for 2', 'To plasser på kveldens felles badstuøkt ved Langkaia.', 1500, 90, 700, 20, 2],
  ['hope-posthallen', 'Klipp og føn', 'En time hos en frisør, ledig etter en avbestilling i siste liten.', 55, 60, 1100, 30],
  ['hope-posthallen', 'Farge og klipp', 'Farge og klipp i morgen formiddag, frigitt etter en avbestilling.', 1380, 120, 2600, 20],
  ['bristol-spa', 'Massasje, 60 minutter', 'En time med massasje og tilgang til basseng og sauna, ledig i kveld.', 180, 90, 1500, 25],
  ['adam-og-eva', 'Klipp', 'Klipp hos en erfaren frisør, ledig etter en avbestilling i dag.', 75, 45, 800, 25],
  ['studio-johnny', 'Klipp og styling', 'Klipp og styling i morgen tidlig, frigitt etter en avbestilling.', 1290, 60, 1100, 20],
  ['bel-etage', 'Farge og føn', 'Fargebehandling og føn, ledig i morgen ettermiddag.', 1500, 120, 2400, 30],
  ['cellar-jazz', 'To plasser på første rad i kveld', 'Plasser på første rad til kveldens konsert på en liten jazzklubb i kjelleren.', 420, 120, 590, 40],
]

type CalendarSeed = { title: string; description: string; start: number; durationMin: number; fullPrice: number; status: Slot['status']; customerName: string; discountPct?: number; guests?: number; id?: string }

function tedsCalendar(now: number): CalendarSeed[] {
  return [
    { title: 'Dekkskift', description: 'Fire hjul byttet og lufttrykk sjekket.', start: at(now, 45, 15), durationMin: 30, fullPrice: 900, status: 'booked', customerName: 'Ingrid H.' },
    { title: 'Dekkskift og balansering', description: 'Fire hjul byttet og balansert mens du venter.', start: at(now, 90, 15), durationMin: 45, fullPrice: 1100, status: 'booked', customerName: 'Lars B.' },
    { title: 'Full service', description: 'Olje, filtre, bremser, væsker og full kontroll.', start: at(now, 165, 15), durationMin: 120, fullPrice: 3900, status: 'released', customerName: 'Anders B.', discountPct: 0 },
    { title: 'Punktering', description: 'Rask reparasjon av punktering.', start: at(now, 240, 15), durationMin: 30, fullPrice: 650, status: 'booked', customerName: 'Sigrid L.' },
    { title: 'Dekkskift', description: 'Fire hjul byttet og lufttrykk sjekket.', start: at(now, 360, 15), durationMin: 30, fullPrice: 900, status: 'booked', customerName: 'Magnus E.' },
    { id: DEMO_TYRE_SLOT, title: 'Dekkskift', description: 'Fire hjul byttet og lufttrykk sjekket, ferdig på en halvtime.', start: onDay(now, 1, 14), durationMin: 30, fullPrice: 900, status: 'booked', customerName: 'Mette K.' },
    { title: 'Bremsekontroll', description: 'Klosser, skiver og bremsevæske kontrollert.', start: onDay(now, 1, 10, 30), durationMin: 45, fullPrice: 590, status: 'booked', customerName: 'Oliver N.' },
    { title: 'Dekkskift', description: 'Fire hjul byttet og lufttrykk sjekket.', start: onDay(now, 1, 16), durationMin: 30, fullPrice: 900, status: 'booked', customerName: 'Sofie H.' },
    { title: 'Henting fra dekkhotell', description: 'Hent dekkene dine fra lageret og få dem montert.', start: onDay(now, 2, 9), durationMin: 30, fullPrice: 900, status: 'booked', customerName: 'Emil R.' },
  ]
}

function lokkaCalendar(now: number): CalendarSeed[] {
  // "I kveld 19:30" for the demo; if it's already too late today, the same table tomorrow.
  const tonight = onDay(now, 0, 19, 30)
  const tableStart = tonight - now > 45 * MIN ? tonight : onDay(now, 1, 19, 30)
  return [
    { title: 'Bord for 4', description: 'Middag, fire gjester.', start: at(now, 120, 15), durationMin: 120, fullPrice: 3400, status: 'booked', customerName: 'Nora V.', guests: 4 },
    { id: DEMO_TABLE_SLOT, title: 'Bord for 2', description: 'Middag for to i det klassiske kaféhuset.', start: tableStart, durationMin: 120, fullPrice: 1700, status: 'booked', customerName: 'Henrik S.', guests: 2 },
    { title: 'Bord for 2', description: 'Middag, to gjester.', start: tableStart + 60 * MIN, durationMin: 120, fullPrice: 1700, status: 'booked', customerName: 'Maja T.', guests: 2 },
    { title: 'Bord for 4', description: 'Middag, fire gjester.', start: onDay(now, 1, 18), durationMin: 120, fullPrice: 3400, status: 'booked', customerName: 'Erik P.', guests: 4 },
    { title: 'Bord for 2', description: 'Middag, to gjester.', start: onDay(now, 1, 20), durationMin: 120, fullPrice: 1600, status: 'booked', customerName: 'Kari N.', guests: 2 },
  ]
}

export const TEMPLATES: Record<Category, [title: string, price: number, guests?: number][]> = {
  food: [['Bord for 2', 1800, 2], ['Bord for 4', 3400, 4], ['Bord for 2', 1500, 2]],
  beauty: [['Klipp og farge', 2200], ['Ansiktsbehandling', 1200], ['Manikyr', 650]],
  car: [['Dekkskift', 900], ['Dekkskift og balansering', 1100], ['Servicesjekk', 2500]],
  experiences: [['Guidet tur', 450], ['Workshopplass', 650], ['Smaksopplevelse', 750]],
}

const CUSTOMER_NAMES = ['Mette K.', 'Lars B.', 'Sigrid L.', 'Magnus E.', 'Ingrid H.', 'Oliver N.', 'Sofie H.', 'Emil R.']

/** Generates a believable calendar for a newly registered Business. */
export function generateCalendar(businessId: string, category: Category, now: number): Slot[] {
  const offsets = [50, 110, 200, 320, 1380, 1500, 1680, 2700]
  return offsets.map((m, i) => {
    const [title, fullPrice, guests] = TEMPLATES[category][i % TEMPLATES[category].length]
    return {
      id: uid('slot'),
      businessId,
      title,
      description: `${title}, synkronisert fra bestillingssystemet ditt.`,
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
  slots.push(
    {
      id: 'demo-jazz-concert',
      businessId: 'cellar-jazz',
      title: 'Jazzkveld, to plasser ved scenen',
      description: 'Et nytt trio-prosjekt spiller sin første konsert. To plasser rett ved scenen ble ledige.',
      start: at(now, 240),
      durationMin: 120,
      fullPrice: 640,
      guests: 2,
      status: 'cancelled',
      customerName: 'Jonas A.',
    },
    {
      id: 'demo-comedy-latter',
      businessId: 'latter',
      title: 'Standup-kveld, to plasser',
      description: 'Kveldens standup med fire komikere. To plasser ved scenekanten ble ledige etter en avbestilling.',
      start: at(now, 240),
      durationMin: 120,
      fullPrice: 780,
      guests: 2,
      status: 'cancelled',
      customerName: 'Silje M.',
    },
  )

  return {
    version: 1,
    seededAt: now,
    businesses: businesses.map((b) => ({ ...b, introSpotsLeft: INTRO_SPOTS })),
    slots,
    rules: {
      [HERO_BUSINESS_ID]: { enabled: true, mode: 'full', leadMinutes: 60, discountPct: 20 },
      [RESTAURANT_ID]: { enabled: true, mode: 'discount', leadMinutes: 120, discountPct: 20 },
    },
    baselines: { ...BASELINES },
    wants: [],
    alerts: [],
    currentBusinessId: HERO_BUSINESS_ID,
  }
}
