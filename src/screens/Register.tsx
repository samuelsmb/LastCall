import { useState } from 'react'
import { CATEGORIES, CATEGORY_META, NEIGHBOURHOODS } from '../domain/categories'
import { registerBusiness } from '../domain/store'
import type { Category } from '../domain/types'
import { go } from '../lib'
import { Button, Card, Chip, Confetti } from '../ui'

const EMOJIS = ['🏪', '✂️', '🍝', '🧁', '🔧', '🧘', '🎨', '🦷', '🐶', '🎳']

export function Register() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [neighbourhood, setNeighbourhood] = useState(NEIGHBOURHOODS[0])
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [done, setDone] = useState(false)

  const submit = () => {
    if (!name.trim() || !category) return
    registerBusiness(name.trim(), category, neighbourhood, emoji)
    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-10 text-center">
        <Confetti />
        <span className="animate-pop text-8xl">{emoji}</span>
        <h1 className="font-display text-5xl font-bold">You're live, {name}!</h1>
        <p className="text-lg text-ink/70">Next time someone cancels on you, LastCall turns that empty chair into money. We synced your calendar already (well, pretended to).</p>
        <Button size="lg" onClick={() => go('/biz')}>
          📅 See my calendar
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-grape">For businesses</p>
        <h1 className="mt-1 font-display text-4xl font-bold leading-tight sm:text-5xl">Cancellations happen. Losing money doesn't have to.</h1>
        <p className="mt-3 text-lg text-ink/70">Join LastCall in 30 seconds. We'll handle the rest.</p>
      </div>

      <Card className="flex flex-col gap-5 p-6">
        <label className="flex flex-col gap-1 font-display font-medium">
          Business name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Brenda's Blowdry Bar"
            className="rounded-2xl border-[3px] border-ink bg-cream px-4 py-3 font-sans text-lg outline-none focus:bg-white"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-display font-medium">What do you offer?</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
              </Chip>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 font-display font-medium">
          Neighbourhood
          <select value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)} className="cursor-pointer rounded-2xl border-[3px] border-ink bg-cream px-4 py-3 font-sans text-lg">
            {NEIGHBOURHOODS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-display font-medium">Pick your mascot</span>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`grid h-12 w-12 cursor-pointer place-items-center rounded-2xl border-[3px] border-ink text-2xl transition hover:-rotate-6 ${emoji === e ? 'bg-sunny shadow-chunky-sm' : 'bg-white'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <Button size="lg" onClick={submit} disabled={!name.trim() || !category}>
          🚀 Go live on LastCall
        </Button>
      </Card>
    </div>
  )
}
