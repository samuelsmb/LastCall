export type Category = 'food' | 'beauty' | 'car' | 'experiences'

export type TimeWindow = 'now' | 'today' | '48h'

/** A Want can also wait for any time: a standing interest rather than a need right now. */
export type NamedWantWindow = TimeWindow | 'any'
/** A named window, or "within N hours" written as e.g. '12h'. */
export type WantWindow = NamedWantWindow | `${number}h`

export type SlotStatus = 'booked' | 'cancelled' | 'held' | 'released' | 'sold'

export interface Business {
  id: string
  name: string
  category: Category
  neighbourhood: string
  address: string
  distanceKm: number
  tagline: string
  /** Photo in public/img (relative path). Falls back to the category band. */
  image?: string
  /** Filled spots still free under the intro offer (starts at 10). */
  introSpotsLeft: number
  orgNumber?: string
  calendar?: string
  /** From Brønnøysundregistrene, without the scheme: "www.example.no". */
  website?: string
}

/** A booking in a Business's calendar. A released Slot is a Last Call. */
export interface Slot {
  id: string
  businessId: string
  title: string
  description: string
  start: number
  durationMin: number
  fullPrice: number
  status: SlotStatus
  customerName?: string
  discountPct?: number
  releasedAt?: number
  soldAt?: number
  buyerName?: string
  /** Car Last Calls only: the Customer's registration number. */
  regNumber?: string
  perk?: string
  /** Restaurant tables only: number of guests. fullPrice is the total for the table. */
  guests?: number
  /** Set when sold: LastCall's fee and how many intro spots it used. */
  fee?: number
  introSpotsUsed?: number
}

export type ReleaseMode = 'full' | 'discount'

export interface AutoReleaseRule {
  enabled: boolean
  /** full: release at once at full price ("Skip the queue"). discount: hold until leadMinutes before start, then release at discountPct off. */
  mode: ReleaseMode
  leadMinutes: number
  discountPct: number
  /** Percent of the sold price the Canceller gets back if their cancelled slot sells on LastCall. 0 turns it off. */
}

export interface Want {
  id: string
  label: string
  categories: Category[]
  window: WantWindow
  /** Set when the Customer follows a Business: matches only its Last Calls. */
  businessId?: string
  /** Neighbourhood the Customer mentioned; shown, not used for matching. */
  area?: string
  createdAt: number
}

export interface Alert {
  id: string
  wantId: string
  slotId: string
  createdAt: number
  seen: boolean
  /** The Customer closed its pop-up; it still counts as unread. */
  dismissed?: boolean
}

/** Month-to-date history before this session, added on top of what happens in the demo. */
export interface Baseline {
  recovered: number
  released: number
  sold: number
  fee: number
}

export interface State {
  version: 1
  seededAt: number
  businesses: Business[]
  slots: Slot[]
  rules: Record<string, AutoReleaseRule>
  baselines: Record<string, Baseline>
  wants: Want[]
  alerts: Alert[]
  currentBusinessId: string
}
