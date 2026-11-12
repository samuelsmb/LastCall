import type { ModelMessage } from 'ai'
import { kr, when } from '../lib'
import type { AssistantTurn } from './assistant'
import { CATEGORIES, CATEGORY_META } from './categories'
import { businessOf, inWindow, isLive, lastCallPrice } from './selectors'
import { addWant, getState, scheduleDemoRelease } from './store'
import { TASTE_PROFILE } from './tasteProfile'
import type { Category, WantWindow } from './types'

const JEV_URL = 'https://openrouter.ai/api/alpha/decisions'
const JEV_MODEL = 'typesafe/jev-1.14'
const MAX_CARDS = 3
/** Below this, Fast mode hands the message to the LLM. */
const MIN_CONFIDENCE = 0.6
const SAYS_YES = /^\s*(ja|jo|gjerne|yes|ok|okay|sure|yep)\b/i

/** A Want Fast mode offered after finding nothing; a following "ja" saves it. */
export interface OfferedWant {
  text: string
  categories: Category[]
  window: WantWindow
}

export interface FastTurn extends AssistantTurn {
  offered: OfferedWant | null
}

type Intent = 'find' | 'recommend' | 'alert' | 'other'

interface JevAnswer {
  choice: string
  confidence: number
  probabilities: Record<string, number>
  /** Yes/no questions: the probability of yes. */
  noul: number
}

const WHEN: Record<WantWindow, string> = { now: ' nå', today: ' i dag', '48h': ' de neste par dagene', any: '' }

async function jev(state: unknown, questions: Record<string, unknown>): Promise<Record<string, JevAnswer>> {
  const res = await fetch(JEV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lastcall.no',
      'X-Title': 'LastCall',
    },
    body: JSON.stringify({ model: JEV_MODEL, state, questions }),
  })
  if (!res.ok) throw new Error(`Jev ${res.status}: ${await res.text()}`)
  return (await res.json()).answers
}

function turn(history: ModelMessage[], text: string, reply: string, slotIds: string[] = [], offered: OfferedWant | null = null): FastTurn {
  const messages: ModelMessage[] = [...history, { role: 'user', content: text }, { role: 'assistant', content: reply }]
  return { messages, reply, slotIds, offered }
}

function saveWant(history: ModelMessage[], text: string, want: OfferedWant, tasteProfile: boolean): FastTurn {
  const label = text.trim().replace(/^./, (c) => c.toUpperCase()).slice(0, 48)
  addWant(label, want.categories, want.window)
  scheduleDemoRelease(want.text, want.categories, tasteProfile)
  const what = tasteProfile ? 'ting du vil like' : want.categories.map((c) => CATEGORY_META[c].label.toLowerCase()).join(' og ')
  return turn(history, text, `Ok! Jeg varsler deg om ${what}${WHEN[want.window]} når noe dukker opp.`)
}

/**
 * Fast mode: one Jev decision call instead of an LLM conversation. Returns null when Jev
 * is unsure or the message is not a find/recommend/alert request, so the LLM takes over.
 */
export async function askFast(history: ModelMessage[], text: string, offered: OfferedWant | null): Promise<FastTurn | null> {
  if (offered && SAYS_YES.test(text)) return saveWant(history, offered.text, offered, false)

  const now = Date.now()
  const state = getState()
  const live = state.slots.filter((s) => isLive(s, now)).slice(0, 250)
  const slotOptions = Object.fromEntries(
    live.map((s) => {
      const biz = businessOf(state, s)
      return [s.id, `${s.title} hos ${biz.name} (${CATEGORY_META[biz.category].label}, ${biz.tagline}), ${when(s.start, now)}, ${kr(lastCallPrice(s))}`]
    }),
  )

  const answers = await jev(
    { melding: text, tidspunkt: when(now, now), smaksprofil: TASTE_PROFILE.summary, last_calls: Object.values(slotOptions) },
    {
      exists: { type: 'noul', instructions: 'Er minst én av last_calls akkurat den typen ting kunden ber om?' },
      taste: { type: 'noul', instructions: 'Ber kunden om noe ut fra egen smak ("ting jeg vil like", "overrask meg") i stedet for noe bestemt?' },
      intent: {
        type: 'choice',
        instructions: 'Hva vil kunden med meldingen?',
        criteria: {
          find: 'Se hva som finnes av noe bestemt, f.eks. "dekkskift i dag", "middag i kveld", "hva skjer i dag"',
          recommend: 'Få en anbefaling ut fra egen smak, f.eks. "noe jeg vil like", "overrask meg", "hva anbefaler du"',
          alert: 'Bli varslet senere når noe dukker opp, f.eks. "varsle meg om ...", "si fra hvis ..."',
          other: 'Noe annet: et spørsmål, småprat, en sammenligning, eller uklart',
        },
      },
      category: {
        type: 'choice',
        instructions: 'Hvilken kategori gjelder meldingen?',
        criteria: {
          ...Object.fromEntries(CATEGORIES.map((c) => [c, CATEGORY_META[c].label])),
          any: 'Ingen bestemt kategori',
        },
      },
      window: {
        type: 'choice',
        instructions: 'Når vil kunden ha det?',
        criteria: { now: 'Nå, innen et par timer', today: 'I dag eller i kveld', '48h': 'I morgen eller de neste dagene', any: 'Ingen tid nevnt' },
      },
      pick: {
        type: 'choice',
        instructions: 'Hvilken Last Call passer best til det kunden ber om? Ber kunden om en anbefaling, velg ut fra smaksprofilen.',
        criteria: { ...slotOptions, none: 'Ingen av disse passer det kunden ber om' },
      },
      reason: {
        type: 'choice',
        instructions: 'Hvilken av kundens interesser passer best til det kunden ber om?',
        criteria: Object.fromEntries(TASTE_PROFILE.interests.map((interest, i) => [`i${i}`, interest])),
      },
    },
  )

  const intent = answers.intent.choice as Intent
  if (intent === 'other' || answers.intent.confidence < MIN_CONFIDENCE) return null

  const category = answers.category.choice as Category | 'any'
  const window = answers.window.choice as WantWindow
  const categories = category === 'any' ? [] : [category]
  const tasteProfile = answers.taste.noul >= 0.5

  if (intent === 'alert') {
    const want: OfferedWant = tasteProfile ? { text, categories: TASTE_PROFILE.categories, window: 'any' } : { text, categories: categories.length ? categories : TASTE_PROFILE.categories, window }
    return saveWant(history, text, want, tasteProfile)
  }

  const ranked = Object.entries(answers.pick.probabilities)
    .filter(([id]) => id !== 'none')
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => live.find((s) => s.id === id)!)
    .filter((s) => intent === 'recommend' || !categories.length || categories.includes(businessOf(state, s).category))
    .filter((s) => window === 'any' || inWindow(s.start, window, now))
  const nothing = (intent === 'find' && answers.exists.noul < 0.5) || ranked.length === 0
  const slotIds = nothing ? [] : ranked.slice(0, MAX_CARDS).map((s) => s.id)

  if (intent === 'recommend') {
    if (nothing) return turn(history, text, 'Jeg fant ingenting som passer deg akkurat nå. Vil du at jeg varsler deg om ting du vil like?')
    const interest = TASTE_PROFILE.interests[Number(answers.reason.choice.slice(1))]
    return turn(history, text, `Siden du liker ${interest}, tror jeg du vil like dette:`, slotIds)
  }

  if (nothing) {
    const offer: OfferedWant = { text, categories: categories.length ? categories : TASTE_PROFILE.categories, window: window === 'now' ? 'today' : window }
    return turn(history, text, `Jeg fant ikke det du ser etter${WHEN[window]} akkurat nå. Vil du at jeg varsler deg når det dukker opp?`, [], offer)
  }
  const topic = category === 'any' ? '' : ` innen ${CATEGORY_META[category].label.toLowerCase()}`
  return turn(history, text, `Her er det jeg fant${topic}${WHEN[window]}:`, slotIds)
}
