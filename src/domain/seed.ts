import { INTRO_SPOTS } from './pricing'
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

const businesses: Omit<Business, 'introSpotsLeft'>[] = [
  { id: HERO_BUSINESS_ID, name: "Ted's Garage", category: 'car', neighbourhood: 'Majorstuen', address: 'Kirkeveien 64', distanceKm: 0.6, tagline: 'Dekk, olje og ærlige råd siden 1987' },
  { id: 'dekkdoktoren', name: 'Dekkdoktoren', category: 'car', neighbourhood: 'Sentrum', address: 'Akersgata 40', distanceKm: 0.5, tagline: 'Dekkhotell og hjulskift' },
  { id: 'wheel-of-fortune', name: 'Wheel of Fortune', category: 'car', neighbourhood: 'Bjørvika', address: 'Dronning Eufemias gate 30', distanceKm: 0.9, tagline: 'Rull inn, rull ut' },
  { id: RESTAURANT_ID, name: 'Theatercaféen', category: 'food', neighbourhood: 'Sentrum', address: 'Stortingsgata 24', distanceKm: 0.4, tagline: 'Klassisk wienerkafé siden 1900' },
  { id: 'fjordbord', name: 'Fjordbord', category: 'food', neighbourhood: 'Bjørvika', address: 'Operagata 9', distanceKm: 0.8, tagline: 'Sjømat med fjordutsikt' },
  { id: 'frogner-counter', name: 'Statholdergaarden', category: 'food', neighbourhood: 'Sentrum', address: 'Rådhusgata 11', distanceKm: 0.3, tagline: 'Nordisk fine dining i en historisk gård' },
  { id: 'hanshaugen-hearth', name: 'Bålhuset', category: 'food', neighbourhood: 'Sentrum', address: 'Prinsens gate 10', distanceKm: 0.3, tagline: 'Ny-nordisk mat tilberedt over åpen ild' },
  { id: 'salong-sagene', name: 'Salong Egertorget', category: 'beauty', neighbourhood: 'Sentrum', address: 'Egertorget 1', distanceKm: 0.2, tagline: 'Frisørsalong midt i Karl Johan' },
  { id: 'nailed-it', name: 'Nailbar Grensen', category: 'beauty', neighbourhood: 'Sentrum', address: 'Grensen 9', distanceKm: 0.3, tagline: 'Neglestudio' },
  { id: 'toyen-fysio', name: 'Sentrum Fysioterapi', category: 'health', neighbourhood: 'Sentrum', address: 'Kristian Augusts gate 13', distanceKm: 0.7, tagline: 'Fysioterapi og idrettsmassasje' },
  { id: 'smile-majorstuen', name: 'Smil Tannklinikk', category: 'health', neighbourhood: 'Sentrum', address: 'Karl Johans gate 22', distanceKm: 0.2, tagline: 'Tannklinikk' },
  { id: 'passport-office', name: 'Pass- og ID-kontoret', category: 'official', neighbourhood: 'Gamle Oslo', address: 'Grønlandsleiret 44', distanceKm: 1.3, tagline: 'Pass og nasjonale ID-kort' },
  { id: 'driving-test', name: 'Trafikkstasjonen', category: 'official', neighbourhood: 'Gamle Oslo', address: 'Oslo', distanceKm: 3.4, tagline: 'Praktiske førerprøver' },
  { id: 'brrrjorvika', name: 'Bjørvika Spa & Badstu', category: 'experiences', neighbourhood: 'Bjørvika', address: 'Langkaia 1', distanceKm: 0.9, tagline: 'Vedfyrt badstu, fjordbad inkludert' },
  { id: 'cellar-jazz', name: 'Herr Nilsen', category: 'experiences', neighbourhood: 'Sentrum', address: 'C.J. Hambros plass 5', distanceKm: 0.5, tagline: 'Live jazz hver kveld' },
  { id: 'escape-toyen', name: 'Rømningsrommet', category: 'experiences', neighbourhood: 'Sentrum', address: 'Storgata 15', distanceKm: 0.4, tagline: 'Escape rooms' },
]

type LastCallSeed = [businessId: string, title: string, description: string, minutesFromNow: number, durationMin: number, fullPrice: number, discountPct: number, guests?: number, perk?: string]

const lastCalls: LastCallSeed[] = [
  [RESTAURANT_ID, 'Smaksmeny, bord for 2', 'Et bord for to ble ledig. Tolv retter fra et av de vanskeligste bordene å få tak i i sentrum.', 200, 180, 3900, 20, 2],
  ['fjordbord', 'Sjømatmeny, bord for 4', 'Et bord for fire ved vinduet ble ledig etter en avbestilling. Skalldyr, fjordutsikt og levende lys.', 300, 150, 6000, 25, 4],
  ['frogner-counter', 'Kjøkkenbord for 2', 'To av åtte plasser ved kjøkkenbenken, vanligvis fullbooket i ukevis. Full pris, men du kommer inn.', 1560, 180, 7000, 0, 2],
  ['hanshaugen-hearth', 'Seks retter, bord for 2', 'Seks retter tilberedt over åpen ild. Et bord for to ble ledig i kveld.', 420, 150, 3300, 15, 2],
  [RESTAURANT_ID, 'Sen bordtid, bord for 4', 'Et sent bord for fire i morgen kveld.', 1500, 150, 6400, 20, 4],
  ['dekkdoktoren', 'Dekkskift', 'Fire hjul byttet og lufttrykk sjekket. Verkstedene er fullbooket i dekksesongen, så dette er sjeldent.', 95, 30, 550, 0],
  ['wheel-of-fortune', 'Dekkskift og balansering', 'Hjulene byttes og balanseres mens du venter. Kaffe inkludert.', 200, 45, 700, 0],
  ['dekkdoktoren', 'Dekkskift', 'Fire hjul byttet. Ta med ditt eget sett eller hent fra dekkhotellet.', 1380, 30, 450, 10],
  ['wheel-of-fortune', 'Dekkskift', 'Hjul byttet, mutrene strammet, ferdig på en halvtime.', 1700, 30, 600, 0],
  [RESTAURANT_ID, 'Smaksmeny, bord for 2', 'Et bord for to i morgen kveld, frigitt etter en avbestilling.', 1580, 180, 3900, 0, 2, 'Hopp over køen'],
  ['fjordbord', 'Sjømatmeny, bord for 2', 'To plasser ved vinduet, ledig i kveld. Dagens fangst og et glass musserende.', 160, 120, 2900, 20, 2],
  ['frogner-counter', 'Kjøkkenbord for 2, sen bordtid', 'Sen bordtid ved kjøkkenbenken i morgen. Seks retter servert foran deg.', 1620, 150, 6200, 10, 2],
  ['hanshaugen-hearth', 'Bord for 4 ved ilden', 'Et stort bord for fire ved åpen ild, ledig i morgen.', 1440, 150, 6000, 20, 4],
  ['dekkdoktoren', 'Dekkskift, vinterdekk', 'Bytt til vinterdekk før første snø. Fire hjul, ferdig på en halvtime.', 40, 30, 550, 15],
  ['wheel-of-fortune', 'Dekkskift, SUV og varebil', 'Større hjul, samme raske service. Hjulene balanseres og mutrene strammes.', 150, 45, 850, 10],
  ['dekkdoktoren', 'Dekkskift med hjulvask', 'Dekkskift og vask av felgene mens du venter.', 1450, 40, 650, 20],
  ['wheel-of-fortune', 'Dekkskift, i morgen tidlig', 'Første time i morgen, før jobb.', 1260, 30, 550, 0],
  ['salong-sagene', 'Klipp og føn', 'En time med en senior frisør, ledig etter en avbestilling i siste liten.', 55, 60, 890, 30],
  ['nailed-it', 'Gelelakk', 'Gelemanikyr på 45 minutter. Holdbar og uten avskalling.', 1560, 45, 650, 25],
  ['toyen-fysio', 'Idrettsfysioterapi', 'En økt på 50 minutter med idrettsfysioterapeut. Ta med den plagen du har ignorert.', 110, 50, 750, 0],
  ['smile-majorstuen', 'Tannrens', 'Time hos tannpleier på 40 minutter.', 1380, 40, 1100, 20],
  ['passport-office', 'Passtime', 'Passtimer har vanligvis seks ukers ventetid. Denne er i dag.', 230, 20, 0, 0, undefined, 'Hopp over 6 ukers ventetid'],
  ['brrrjorvika', 'Privat badstu for 6', 'To timer i vedfyrt badstu ved fjorden, kun for gruppen din. Hopp i fjorden mellom øktene.', 240, 120, 1800, 30],
  ['cellar-jazz', 'To plasser på første rad i kveld', 'Plasser på første rad til kveldens konsert på en liten jazzklubb i kjelleren.', 420, 120, 590, 40],
]

type CalendarSeed = { title: string; description: string; start: number; durationMin: number; fullPrice: number; status: Slot['status']; customerName: string; discountPct?: number; guests?: number; id?: string }

function tedsCalendar(now: number): CalendarSeed[] {
  return [
    { title: 'Dekkskift', description: 'Fire hjul byttet og lufttrykk sjekket.', start: at(now, 45, 15), durationMin: 30, fullPrice: 550, status: 'booked', customerName: 'Ingrid H.' },
    { title: 'Dekkskift og balansering', description: 'Fire hjul byttet og balansert mens du venter.', start: at(now, 90, 15), durationMin: 45, fullPrice: 700, status: 'booked', customerName: 'Lars B.' },
    { title: 'Full service', description: 'Olje, filtre, bremser, væsker og full kontroll.', start: at(now, 165, 15), durationMin: 120, fullPrice: 2900, status: 'released', customerName: 'Anders B.', discountPct: 0 },
    { title: 'Punktering', description: 'Rask reparasjon av punktering.', start: at(now, 240, 15), durationMin: 30, fullPrice: 450, status: 'booked', customerName: 'Sigrid L.' },
    { title: 'Dekkskift', description: 'Fire hjul byttet og lufttrykk sjekket.', start: at(now, 360, 15), durationMin: 30, fullPrice: 550, status: 'booked', customerName: 'Magnus E.' },
    { id: DEMO_TYRE_SLOT, title: 'Dekkskift', description: 'Fire hjul byttet og lufttrykk sjekket, ferdig på en halvtime.', start: onDay(now, 1, 14), durationMin: 30, fullPrice: 550, status: 'booked', customerName: 'Mette K.' },
    { title: 'Bremsekontroll', description: 'Klosser, skiver og bremsevæske kontrollert.', start: onDay(now, 1, 10, 30), durationMin: 45, fullPrice: 650, status: 'booked', customerName: 'Oliver N.' },
    { title: 'Dekkskift', description: 'Fire hjul byttet og lufttrykk sjekket.', start: onDay(now, 1, 16), durationMin: 30, fullPrice: 550, status: 'booked', customerName: 'Sofie H.' },
    { title: 'Henting fra dekkhotell', description: 'Hent dekkene dine fra lageret og få dem montert.', start: onDay(now, 2, 9), durationMin: 30, fullPrice: 600, status: 'booked', customerName: 'Emil R.' },
  ]
}

function lokkaCalendar(now: number): CalendarSeed[] {
  // "I kveld 19:30" for the demo; if it's already too late today, the same table tomorrow.
  const tonight = onDay(now, 0, 19, 30)
  const tableStart = tonight - now > 45 * MIN ? tonight : onDay(now, 1, 19, 30)
  return [
    { title: 'Bord for 4', description: 'Smaksmeny, fire gjester.', start: at(now, 120, 15), durationMin: 180, fullPrice: 7800, status: 'booked', customerName: 'Nora V.', guests: 4 },
    { id: DEMO_TABLE_SLOT, title: 'Bord for 2', description: 'Nordisk smaksmeny med tolv retter for to.', start: tableStart, durationMin: 180, fullPrice: 4000, status: 'booked', customerName: 'Henrik S.', guests: 2 },
    { title: 'Bord for 2', description: 'Smaksmeny, to gjester.', start: tableStart + 60 * MIN, durationMin: 180, fullPrice: 4000, status: 'booked', customerName: 'Maja T.', guests: 2 },
    { title: 'Bord for 4', description: 'Smaksmeny, fire gjester.', start: onDay(now, 1, 18), durationMin: 180, fullPrice: 7800, status: 'booked', customerName: 'Erik P.', guests: 4 },
    { title: 'Bord for 2', description: 'Smaksmeny, to gjester.', start: onDay(now, 1, 20), durationMin: 180, fullPrice: 3900, status: 'booked', customerName: 'Kari N.', guests: 2 },
  ]
}

const TEMPLATES: Record<Category, [title: string, price: number, guests?: number][]> = {
  food: [['Bord for 2', 3600, 2], ['Bord for 4', 7000, 4], ['Bord for 2', 3000, 2]],
  beauty: [['Klipp og farge', 1600], ['Ansiktsbehandling', 1100], ['Manikyr', 550]],
  car: [['Dekkskift', 550], ['Dekkskift og balansering', 700], ['Servicesjekk', 1800]],
  health: [['Fysioterapi', 750], ['Massasje, 60 min', 900], ['Kontroll', 1100]],
  official: [['Passtime', 650], ['Fornying av ID-kort', 300], ['Førerprøve', 1300]],
  experiences: [['Guidet tur', 450], ['Workshopplass', 650], ['Smaksopplevelse', 750]],
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

  return {
    version: 1,
    seededAt: now,
    businesses: businesses.map((b) => ({ ...b, introSpotsLeft: INTRO_SPOTS })),
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
