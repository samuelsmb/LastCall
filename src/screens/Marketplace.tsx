import { useMemo, useState } from 'react'
import { LastCallCard } from '../components/LastCallCard'
import { CATEGORIES, CATEGORY_META, WINDOW_META } from '../domain/categories'
import { marketplace, type SortKey } from '../domain/selectors'
import { useAppState } from '../domain/store'
import type { Category, TimeWindow } from '../domain/types'
import { go, useNow } from '../lib'
import { Button, Chip, Mascot, Segmented } from '../ui'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'soonest', label: '⏰ Soonest' },
  { value: 'discount', label: '💸 Biggest discount' },
  { value: 'nearest', label: '📍 Nearest' },
]

export function Marketplace() {
  const state = useAppState()
  const now = useNow()
  const [categories, setCategories] = useState<Category[]>([])
  const [window, setWindow] = useState<TimeWindow | null>(null)
  const [sort, setSort] = useState<SortKey>('soonest')

  const list = useMemo(() => marketplace(state, now, { categories, window, sort }), [state, now, categories, window, sort])

  const toggle = (c: Category) => setCategories(categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c])

  const surprise = () => {
    const pool = list.length ? list : marketplace(state, now, { categories: [], window: null, sort: 'soonest' })
    if (pool.length) go(`/lc/${pool[Math.floor(Math.random() * pool.length)].id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] border-[3px] border-ink bg-grape p-6 text-white shadow-chunky-lg sm:p-10">
        <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-bubble/60" />
        <div className="absolute -bottom-10 right-24 h-32 w-32 rounded-full bg-sunny/70" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-sunny">The cancellation economy</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
              Someone bailed.
              <br />
              <span className="text-sunny">Your gain.</span> 🎉
            </h1>
            <p className="mt-3 text-lg text-white/85">
              Freshly cancelled slots across Cooler Copenhagen, at a discount, right now. Tyres, tasting menus and everything in between.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="sunny" size="lg" onClick={surprise}>
                🎲 I'm bored, surprise me
              </Button>
              <Button variant="secondary" size="lg" onClick={() => go('/wants')}>
                🔔 Tell me when…
              </Button>
            </div>
          </div>
          <Mascot size="text-[7rem] sm:text-[9rem]" className="self-center drop-shadow-[6px_6px_0_rgba(30,27,46,0.5)]" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap">
          <Chip active={categories.length === 0} onClick={() => setCategories([])}>
            ✨ Everything
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)}>
              {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented value={window} onChange={setWindow} options={(['now', 'today', '48h'] as TimeWindow[]).map((w) => ({ value: w, label: WINDOW_META[w].label }))} />
          <label className="flex items-center gap-2 font-display text-sm font-medium">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="cursor-pointer rounded-full border-2 border-ink bg-white px-3 py-1.5 font-display font-medium"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <p className="font-display font-medium text-ink/60">
        {list.length} Last Call{list.length === 1 ? '' : 's'} up for grabs
      </p>

      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <LastCallCard key={s.id} state={state} slot={s} now={now} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-[3px] border-dashed border-ink/40 bg-white/60 p-10 text-center">
          <span className="animate-float text-6xl">🦗</span>
          <h3 className="font-display text-2xl font-bold">Crickets… for now</h3>
          <p className="max-w-sm text-ink/70">Nobody has bailed on that yet. Widen your search, or save a Want and we'll ring the bell the second it happens.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCategories([])
                setWindow(null)
              }}
            >
              Show everything
            </Button>
            <Button onClick={() => go('/wants')}>🔔 Save a Want</Button>
          </div>
        </div>
      )}
    </div>
  )
}
