import type { Category, TimeWindow } from './types'

export const CATEGORIES: Category[] = ['food', 'beauty', 'car', 'health', 'official', 'experiences']

export const CATEGORY_META: Record<Category, { label: string; panel: string }> = {
  food: { label: 'Dining', panel: 'from-[#2a0b0f] via-[#4a141b] to-[#7a2a31]' },
  beauty: { label: 'Beauty & Spa', panel: 'from-[#4a3530] via-[#7d5f55] to-[#b89584]' },
  car: { label: 'Automotive', panel: 'from-[#121416] via-[#26292d] to-[#474c52]' },
  health: { label: 'Wellbeing', panel: 'from-[#1f2a23] via-[#33463a] to-[#617a68]' },
  official: { label: 'Official', panel: 'from-[#0f1729] via-[#1d2b4a] to-[#3a4f78]' },
  experiences: { label: 'Experiences', panel: 'from-[#0f221b] via-[#1b3d31] to-[#3b6a57]' },
}

export const WINDOW_META: Record<TimeWindow, { label: string; hint: string }> = {
  now: { label: 'Imminently', hint: 'within two hours' },
  today: { label: 'Today', hint: 'before midnight' },
  '48h': { label: 'Within 48 hours', hint: 'within 48 hours' },
}

export const NEIGHBOURHOODS = ['Indre By', 'Christianshavn', 'Frederiksberg', 'Østerbro', 'Nørrebro', 'Vesterbro', 'Nyhavn', 'Holmen', 'Valby', 'Amager']
