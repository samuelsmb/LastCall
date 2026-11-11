import { useState } from 'react'
import { CATEGORIES, CATEGORY_META, NEIGHBOURHOODS } from '../domain/categories'
import { registerBusiness } from '../domain/store'
import type { Category } from '../domain/types'
import { go } from '../lib'
import { Button, Chip } from '../ui'

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
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-14 text-center">
        <span className="grid h-16 w-16 animate-rise place-items-center rounded-full bg-green text-3xl text-white">✓</span>
        <h1 className="display-2">You're live on LastCall</h1>
        <p className="text-lg text-muted">We've synced your calendar. Next time someone cancels on {name}, you can turn that empty slot into revenue in one click.</p>
        <Button size="lg" onClick={() => go('/biz')}>
          Go to your dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <div className="text-center">
        <span className="eyebrow inline-block rounded-full bg-canvas px-2.5 py-1 text-primary shadow-soft">For businesses</span>
        <h1 className="display-2 mt-4">Turn cancellations into revenue</h1>
        <p className="mt-4 text-lg text-muted">Join LastCall in 30 seconds. We'll take it from there.</p>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft sm:p-8">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Business name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Brenda's Hair Studio"
            className="rounded border border-[#ddd] bg-canvas px-3 py-2.5 outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="eyebrow text-muted">What do you offer?</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                <span>{CATEGORY_META[c].icon}</span> {CATEGORY_META[c].label}
              </Chip>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="eyebrow text-muted">Neighbourhood</span>
          <select value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)} className="cursor-pointer rounded border border-[#ddd] bg-canvas px-3 py-2.5 outline-none">
            {NEIGHBOURHOODS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>

        <Button size="lg" onClick={submit} disabled={!name.trim() || !category}>
          Create business
        </Button>
      </div>
    </div>
  )
}
