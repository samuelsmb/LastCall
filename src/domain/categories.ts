import { Car, Scissors, Ticket, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import type { Category, TimeWindow, WantWindow } from './types'

export const CATEGORIES: Category[] = ['food', 'car', 'beauty', 'experiences']

/** Sticker colours are decoration only: bands, icon tiles and dots. Never actions. */
export const CATEGORY_META: Record<Category, { label: string; icon: LucideIcon; band: string; tint: string; text: string; dot: string }> = {
  food: { label: 'Restaurant', icon: UtensilsCrossed, band: 'bg-orange', tint: 'bg-orange/10', text: 'text-orange-deep', dot: 'bg-orange' },
  car: { label: 'Verksted', icon: Car, band: 'bg-sky', tint: 'bg-sky/15', text: 'text-[#1d5d94]', dot: 'bg-sky' },
  beauty: { label: 'Skjønnhet', icon: Scissors, band: 'bg-pink', tint: 'bg-pink/10', text: 'text-[#9b1f6e]', dot: 'bg-pink' },
  experiences: { label: 'Opplevelse', icon: Ticket, band: 'bg-green', tint: 'bg-green/10', text: 'text-[#13772a]', dot: 'bg-green' },
}

export const WINDOW_META: Record<TimeWindow, { label: string; hint: string }> = {
  now: { label: 'Nå', hint: 'innen 2 timer' },
  today: { label: 'I dag', hint: 'før midnatt' },
  '48h': { label: 'Neste 48 t', hint: 'innen 48 timer' },
}

export const WANT_WINDOW_META: Record<WantWindow, { label: string; hint: string }> = {
  ...WINDOW_META,
  any: { label: 'Når som helst', hint: 'når som helst' },
}

export const NEIGHBOURHOODS = ['Sentrum', 'Grünerløkka', 'Majorstuen', 'Frogner', 'Bjørvika', 'Alna', 'Rødtvet', 'Gamle Oslo', 'Tøyen', 'Sagene', 'St. Hanshaugen']

/** Rough Oslo postcode ranges for our neighbourhoods; good enough to prefill, the Business can edit it. */
const OSLO_POSTCODES: [from: number, to: number, neighbourhood: string][] = [
  [1, 169, 'Sentrum'],
  [170, 179, 'St. Hanshaugen'],
  [180, 190, 'Gamle Oslo'],
  [191, 194, 'Bjørvika'],
  [195, 199, 'Gamle Oslo'],
  [250, 287, 'Frogner'],
  [301, 379, 'Majorstuen'],
  [440, 469, 'Sagene'],
  [550, 559, 'Grünerløkka'],
  [560, 569, 'Tøyen'],
  [570, 579, 'Grünerløkka'],
  [660, 679, 'Alna'],
  [950, 969, 'Rødtvet'],
  [650, 659, 'Gamle Oslo'],
]

export function neighbourhoodFromPostcode(postcode: string): string | null {
  const n = Number(postcode)
  if (!postcode || Number.isNaN(n)) return null
  return OSLO_POSTCODES.find(([from, to]) => n >= from && n <= to)?.[2] ?? null
}
