import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText, isStepCount, Output, tool, type ModelMessage } from 'ai'
import { z } from 'zod'
import { kr, when } from '../lib'
import { CATEGORIES, CATEGORY_META, WANT_WINDOW_META } from './categories'
import { DEMO_JAZZ_SLOT } from './seed'
import { businessOf, inWindow, isLive, lastCallPrice } from './selectors'
import { addWant, getState, releaseSlot } from './store'
import { TASTE_PROFILE } from './tasteProfile'
import type { Category, WantWindow } from './types'

export const ASSISTANT_MODEL = 'openai/gpt-4o-mini'
const MAX_CARDS = 3
const DEMO_RELEASE_DELAY = 5_000

const openrouter = createOpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_KEY,
  headers: { 'HTTP-Referer': 'https://lastcall.no', 'X-Title': 'LastCall' },
})

const categoryEnum = z.enum(CATEGORIES as [Category, ...Category[]])
const windowEnum = z.enum(['now', 'today', '48h', 'any'] satisfies WantWindow[])

function system(now: number) {
  const categories = CATEGORIES.map((c) => `${c} (${CATEGORY_META[c].label})`).join(', ')
  return `Du er Assistent i LastCall, en markedsplass i Oslo der bedrifter selger ledige timer og bord etter avbestillinger ("Last Calls").
Nå er det ${when(now, now)}.

Kundens smaksprofil: ${TASTE_PROFILE.summary}

Du kan:
1. Finne Last Calls: bruk searchLastCalls.
2. Anbefale Last Calls ("noe jeg vil like", "overrask meg", "hva anbefaler du"): søk med searchLastCalls og velg ut fra smaksprofilen. Anbefal aldri noe som ikke passer profilen.
3. Sette opp et ønske, så kunden får et varsel når en passende Last Call frigis: kall createWant nøyaktig én gang. Gjelder det "ting jeg vil like", sett fromTasteProfile til true.

Svaret ditt:
- reply: norsk bokmål, kort og vennlig, 1-2 setninger uten lister eller markdown. Ved anbefaling: si kort hvorfor det passer kunden.
- slotIds: id-ene til Last Calls du nevner (maks ${MAX_CARDS}), i prioritert rekkefølge. Kortene viser pris og tid, så ikke gjenta det i teksten.
Finn aldri på Last Calls. Finnes det ingen treff, si det og tilby å sette opp et varsel.
Kategorier: ${categories}.`
}

export interface AssistantTurn {
  messages: ModelMessage[]
  reply: string
  slotIds: string[]
}

/** Runs one Customer message through the model, with tools over the store. */
export async function askAssistant(history: ModelMessage[], text: string): Promise<AssistantTurn> {
  const now = Date.now()

  const tools = {
    searchLastCalls: tool({
      description: 'Søk blant Last Calls som er til salgs nå.',
      inputSchema: z.object({
        categories: z.array(categoryEnum).optional().describe('Tom eller utelatt betyr alle kategorier.'),
        window: windowEnum.optional().describe('now = innen 2 timer, today = i dag, 48h = innen 48 timer, any = når som helst'),
      }),
      execute: async ({ categories, window }) => {
        const state = getState()
        return state.slots
          .filter((s) => isLive(s, now))
          .filter((s) => !categories?.length || categories.includes(businessOf(state, s).category))
          .filter((s) => !window || inWindow(s.start, window, now))
          .sort((a, b) => a.start - b.start)
          .slice(0, 20)
          .map((s) => {
            const biz = businessOf(state, s)
            return {
              id: s.id,
              title: s.title,
              description: s.description,
              business: biz.name,
              tagline: biz.tagline,
              category: biz.category,
              neighbourhood: biz.neighbourhood,
              when: when(s.start, now),
              price: kr(lastCallPrice(s)),
              discountPct: s.discountPct ?? 0,
            }
          })
      },
    }),
    getTasteProfile: tool({
      description: 'Hent kundens smaksprofil: hva hun liker, og hvilke kategorier det gjelder.',
      inputSchema: z.object({}),
      execute: async () => TASTE_PROFILE,
    }),
    createWant: tool({
      description: 'Lagre et ønske, så varsler LastCall kunden når en passende Last Call frigis.',
      inputSchema: z.object({
        label: z.string().describe('Kort beskrivelse på norsk, f.eks. "Jazz i kveld"'),
        categories: z.array(categoryEnum).min(1).describe('Ved fromTasteProfile brukes profilens kategorier i stedet.'),
        window: windowEnum,
        area: z.string().optional().describe('Bydel i Oslo, hvis kunden nevnte en'),
        fromTasteProfile: z.boolean().describe('true når kunden vil varsles om ting hun liker'),
      }),
      execute: async ({ label, categories, window, area, fromTasteProfile }) => {
        const cats = fromTasteProfile ? TASTE_PROFILE.categories : categories
        const win = fromTasteProfile ? 'any' : window
        addWant(label, cats, win, area)
        if (fromTasteProfile) setTimeout(() => releaseSlot(DEMO_JAZZ_SLOT, 30), DEMO_RELEASE_DELAY)
        return { saved: true, label, categories: cats, window: WANT_WINDOW_META[win].hint }
      },
    }),
  }

  const messages: ModelMessage[] = [...history, { role: 'user', content: text }]
  const result = await generateText({
    model: openrouter(ASSISTANT_MODEL),
    system: system(now),
    messages,
    tools,
    output: Output.object({ schema: z.object({ reply: z.string(), slotIds: z.array(z.string()) }) }),
    stopWhen: isStepCount(6),
  })
  const state = getState()
  const slotIds = result.output.slotIds.filter((id) => state.slots.some((s) => s.id === id && isLive(s, now))).slice(0, MAX_CARDS)
  return { messages: [...messages, ...result.response.messages], reply: result.output.reply, slotIds }
}
