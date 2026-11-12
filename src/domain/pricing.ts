import type { Business, Slot } from './types'

export const FEE_PER_SPOT = 49
export const FEE_CAP_PCT = 10
export const INTRO_SPOTS = 10

export function lastCallPrice(slot: Pick<Slot, 'fullPrice' | 'discountPct'>) {
  const d = slot.discountPct ?? 0
  if (d === 0) return slot.fullPrice
  return Math.round((slot.fullPrice * (1 - d / 100)) / 5) * 5
}

/** A filled spot is one appointment, or one guest at a restaurant table. */
export function spotsOf(slot: Pick<Slot, 'guests'>) {
  return slot.guests ?? 1
}

export interface Fee {
  spots: number
  price: number
  /** What the fee would be without the intro offer. */
  standardFee: number
  fee: number
  introSpotsUsed: number
}

/**
 * LastCall's fee for filling one Last Call: 49 kr per filled spot, never more than 10% of the sold price.
 * While the Business has intro spots left the whole listing is free (a table is never split), and it
 * uses up to its number of spots from the intro offer.
 */
export function calculateFee(listing: Pick<Slot, 'fullPrice' | 'discountPct' | 'guests'>, business: Pick<Business, 'introSpotsLeft'>): Fee {
  const spots = spotsOf(listing)
  const price = lastCallPrice(listing)
  const standardFee = Math.min(FEE_PER_SPOT * spots, Math.round((price * FEE_CAP_PCT) / 100))
  const left = Math.max(0, business.introSpotsLeft)
  if (left > 0) return { spots, price, standardFee, fee: 0, introSpotsUsed: Math.min(spots, left) }
  return { spots, price, standardFee, fee: standardFee, introSpotsUsed: 0 }
}
