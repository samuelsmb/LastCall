import { useState } from 'react'
import { CATEGORIES, CATEGORY_META, NEIGHBOURHOODS } from '../domain/categories'
import { registerBusiness } from '../domain/store'
import type { Category } from '../domain/types'
import { go } from '../lib'
import { BellIcon, Button, Chip, Ornament } from '../ui'

export function Register() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [neighbourhood, setNeighbourhood] = useState(NEIGHBOURHOODS[0])
  const [done, setDone] = useState(false)

  const submit = () => {
    if (!name.trim() || !category) return
    registerBusiness(name.trim(), category, neighbourhood)
    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-16 text-center">
        <BellIcon className="h-16 w-14 text-gold" />
        <p className="eyebrow text-gold">Application approved</p>
        <h1 className="font-display text-6xl leading-none">
          Welcome to the collection, <em>{name}</em>.
        </h1>
        <Ornament />
        <p className="text-lg text-ink/60">Your reservations book has been synchronised. Henceforth, a cancellation is merely an opportunity.</p>
        <Button size="lg" onClick={() => go('/biz')}>
          View your reservations
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-12">
      <div className="text-center">
        <p className="eyebrow text-gold">For establishments</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-6xl">
          Cancellations are inevitable.
          <br />
          <em className="text-ink/60">Losing revenue is not.</em>
        </h1>
        <p className="mt-6 text-lg text-ink/60">LastCall admits establishments by application only. The application takes thirty seconds. We approve those of taste.</p>
      </div>

      <div className="flex flex-col gap-10 border border-ink/10 bg-ivory p-8 sm:p-12">
        <label className="flex flex-col gap-2">
          <span className="eyebrow text-stone">Name of establishment</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maison …"
            className="border-b border-ink/30 bg-transparent py-2 font-display text-3xl outline-none placeholder:italic placeholder:text-ink/30 focus:border-gold"
          />
        </label>

        <div className="flex flex-col gap-3">
          <span className="eyebrow text-stone">Your discipline</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_META[c].label}
              </Chip>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="eyebrow text-stone">Quarter</span>
          <select value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)} className="cursor-pointer border-b border-ink/30 bg-transparent py-2 font-display text-2xl outline-none">
            {NEIGHBOURHOODS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>

        <Button size="lg" onClick={submit} disabled={!name.trim() || !category}>
          Submit application
        </Button>
      </div>
    </div>
  )
}
