import type { Category } from './types'

export interface TasteProfile {
  name: string
  summary: string
  /** The Categories a "things I'd like" Want covers. */
  categories: Category[]
}

/** The demo Customer's Taste profile. */
export const TASTE_PROFILE: TasteProfile = {
  name: 'Kari',
  summary:
    'Kari, 29, bor på Grünerløkka. Elsker nye musikkopplevelser, spesielt live jazz og små, intime konsertscener. ' +
    'Liker smaksmenyer og nordisk mat når det er en god anledning. Prisbevisst og glad i et godt tilbud, ' +
    'men betaler gjerne fullpris for noe sjeldent.',
  categories: ['experiences', 'food'],
}
