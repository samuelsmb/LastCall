import type { Category, TimeWindow } from './types'

export const CATEGORIES: Category[] = ['food', 'beauty', 'car', 'health', 'official', 'experiences']

export const CATEGORY_META: Record<Category, { label: string; emoji: string; bg: string; soft: string }> = {
  food: { label: 'Food', emoji: '🍽️', bg: 'bg-tomato', soft: 'bg-tomato/15' },
  beauty: { label: 'Beauty & Spa', emoji: '💅', bg: 'bg-bubble', soft: 'bg-bubble/20' },
  car: { label: 'Car', emoji: '🛞', bg: 'bg-sky', soft: 'bg-sky/20' },
  health: { label: 'Health', emoji: '🩺', bg: 'bg-mint', soft: 'bg-mint/20' },
  official: { label: 'Official appointments', emoji: '🛂', bg: 'bg-sunny', soft: 'bg-sunny/25' },
  experiences: { label: 'Experiences', emoji: '🎢', bg: 'bg-grape', soft: 'bg-grape/15' },
}

export const WINDOW_META: Record<TimeWindow, { label: string; hint: string }> = {
  now: { label: 'Now', hint: 'within 2h' },
  today: { label: 'Today', hint: 'before midnight' },
  '48h': { label: 'Next 48h', hint: 'within 48h' },
}

export const NEIGHBOURHOODS = [
  'Nørrecool',
  'Vesterbrrr',
  'Frostiansberg',
  'Chillhavn',
  'Østerbreeze',
  'Amagerbrrr',
  'Valby Vibes',
  'Rådhus Rink',
]
