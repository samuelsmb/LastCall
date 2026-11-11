import type { Category, TimeWindow } from './types'

export const CATEGORIES: Category[] = ['food', 'car', 'beauty', 'health', 'official', 'experiences']

/** Sticker colours are decoration only: bands, icon tiles and dots. Never actions. */
export const CATEGORY_META: Record<Category, { label: string; icon: string; band: string; tint: string; text: string; dot: string }> = {
  food: { label: 'Fine dining', icon: '🍽️', band: 'bg-orange', tint: 'bg-orange/10', text: 'text-orange-deep', dot: 'bg-orange' },
  car: { label: 'Dekkskift', icon: '🚗', band: 'bg-sky', tint: 'bg-sky/15', text: 'text-[#1d5d94]', dot: 'bg-sky' },
  beauty: { label: 'Skjønnhet og spa', icon: '💅', band: 'bg-pink', tint: 'bg-pink/10', text: 'text-[#9b1f6e]', dot: 'bg-pink' },
  health: { label: 'Helse', icon: '🩺', band: 'bg-teal', tint: 'bg-teal/10', text: 'text-[#1c6b68]', dot: 'bg-teal' },
  official: { label: 'Offentlig', icon: '🏛️', band: 'bg-purple', tint: 'bg-purple/30', text: 'text-purple-deep', dot: 'bg-purple' },
  experiences: { label: 'Opplevelser', icon: '🎟️', band: 'bg-green', tint: 'bg-green/10', text: 'text-[#13772a]', dot: 'bg-green' },
}

export const WINDOW_META: Record<TimeWindow, { label: string; hint: string }> = {
  now: { label: 'Nå', hint: 'innen 2 timer' },
  today: { label: 'I dag', hint: 'før midnatt' },
  '48h': { label: 'Neste 48 t', hint: 'innen 48 timer' },
}

export const NEIGHBOURHOODS = ['Sentrum', 'Grünerløkka', 'Majorstuen', 'Frogner', 'Bjørvika', 'Bjerke', 'Storo', 'Gamle Oslo', 'Tøyen', 'Sagene', 'St. Hanshaugen']
