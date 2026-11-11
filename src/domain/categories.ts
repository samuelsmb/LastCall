import type { Category, TimeWindow } from './types'

export const CATEGORIES: Category[] = ['food', 'beauty', 'car', 'health', 'official', 'experiences']

/** Sticker colours are decoration only: bands, icon tiles and dots. Never actions. */
export const CATEGORY_META: Record<Category, { label: string; icon: string; band: string; tint: string; text: string; dot: string }> = {
  food: { label: 'Dining', icon: '🍽️', band: 'bg-orange', tint: 'bg-orange/10', text: 'text-orange-deep', dot: 'bg-orange' },
  beauty: { label: 'Beauty & Spa', icon: '💅', band: 'bg-pink', tint: 'bg-pink/10', text: 'text-[#9b1f6e]', dot: 'bg-pink' },
  car: { label: 'Car', icon: '🚗', band: 'bg-sky', tint: 'bg-sky/15', text: 'text-[#1d5d94]', dot: 'bg-sky' },
  health: { label: 'Health', icon: '🩺', band: 'bg-teal', tint: 'bg-teal/10', text: 'text-[#1c6b68]', dot: 'bg-teal' },
  official: { label: 'Official', icon: '🏛️', band: 'bg-purple', tint: 'bg-purple/30', text: 'text-purple-deep', dot: 'bg-purple' },
  experiences: { label: 'Experiences', icon: '🎟️', band: 'bg-green', tint: 'bg-green/10', text: 'text-[#13772a]', dot: 'bg-green' },
}

export const WINDOW_META: Record<TimeWindow, { label: string; hint: string }> = {
  now: { label: 'Now', hint: 'within 2 hours' },
  today: { label: 'Today', hint: 'before midnight' },
  '48h': { label: 'Next 48h', hint: 'within 48 hours' },
}

export const NEIGHBOURHOODS = ['Indre By', 'Christianshavn', 'Frederiksberg', 'Østerbro', 'Nørrebro', 'Vesterbro', 'Nyhavn', 'Holmen', 'Valby', 'Amager']
