import { useMemo, useState } from 'react'
import { LastCallCard } from '../components/LastCallCard'
import { CATEGORIES, CATEGORY_META, WINDOW_META } from '../domain/categories'
import { marketplace, type SortKey } from '../domain/selectors'
import { useAppState } from '../domain/store'
import type { Category, TimeWindow } from '../domain/types'
import { go, useNow } from '../lib'
import { Button, Chip, Mascot, Segmented } from '../ui'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'soonest', label: 'Soonest' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'nearest', label: 'Nearest' },
]

const STARS = [
  ['8%', '20%', 'bg-purple', 'h-2 w-2'],
  ['18%', '78%', 'bg-sky', 'h-1.5 w-1.5'],
  ['30%', '12%', 'bg-pink', 'h-1.5 w-1.5'],
  ['62%', '88%', 'bg-green', 'h-2 w-2'],
  ['80%', '30%', 'bg-orange', 'h-1.5 w-1.5'],
  ['45%', '60%', 'bg-white', 'h-1 w-1'],
  ['12%', '50%', 'bg-white', 'h-1 w-1'],
  ['88%', '70%', 'bg-teal', 'h-2 w-2'],
] as const

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
    <div className="flex flex-col gap-10">
      <section className="relative -mx-4 overflow-hidden bg-night px-6 py-14 text-white sm:mx-0 sm:rounded-2xl sm:px-12 sm:py-16">
        {STARS.map(([top, left, color, size], i) => (
          <span key={i} className={`absolute animate-twinkle rounded-full ${color} ${size}`} style={{ top, left, animationDelay: `${i * 0.4}s` }} />
        ))}
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="eyebrow inline-block rounded-full bg-canvas px-2.5 py-1 text-primary">New in Cooler Copenhagen</span>
            <h1 className="display-2 mt-5 sm:display-1">Someone cancelled. Now it's yours.</h1>
            <p className="mt-5 text-lg text-white/80">
              LastCall finds last-minute openings at restaurants, salons, garages and more, the moment a booking is cancelled. Book in seconds, usually for less.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={surprise}>Surprise me</Button>
              <Button variant="secondary" onClick={() => go('/wants')}>
                Set up an alert
              </Button>
            </div>
          </div>
          <div className="grid h-44 w-44 shrink-0 place-items-start justify-center self-center rounded-[28px] bg-white/10 pt-6 sm:h-52 sm:w-52">
            <Mascot className="text-[6.5rem] sm:text-[8rem]" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="heading-1">Available now</h2>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={categories.length === 0} onClick={() => setCategories([])}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)}>
              <span>{CATEGORY_META[c].icon}</span> {CATEGORY_META[c].label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Segmented value={window} onChange={setWindow} options={(['now', 'today', '48h'] as TimeWindow[]).map((w) => ({ value: w, label: WINDOW_META[w].label }))} />
            <span className="hidden text-[15px] text-muted sm:inline">
              {list.length} Last Call{list.length === 1 ? '' : 's'}
            </span>
          </div>
          <label className="flex items-center gap-2 text-[15px] text-muted">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="cursor-pointer rounded-lg border border-hairline bg-canvas px-2.5 py-1.5 font-medium text-ink outline-none">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <LastCallCard key={s.id} state={state} slot={s} now={now} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-canvas px-6 py-16 text-center">
          <span className="text-5xl">🔍</span>
          <h3 className="heading-2">Nothing matches right now</h3>
          <p className="max-w-md text-muted">Try a wider filter, or set up an alert and we'll let you know as soon as something opens up.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button
              variant="utility"
              onClick={() => {
                setCategories([])
                setWindow(null)
              }}
            >
              Clear filters
            </Button>
            <Button onClick={() => go('/wants')}>Set up an alert</Button>
          </div>
        </div>
      )}
    </div>
  )
}
