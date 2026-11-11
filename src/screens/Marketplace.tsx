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
  { value: 'discount', label: 'Most generous' },
  { value: 'nearest', label: 'Nearest' },
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
    <div className="flex flex-col gap-12">
      <section className="relative -mx-5 overflow-hidden bg-ink px-6 py-16 text-paper sm:mx-0 sm:px-14 sm:py-20">
        <div className="absolute inset-4 border border-gold/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgb(176_141_87/0.18),transparent_55%)]" />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">Cooler Copenhagen · This evening</p>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] sm:text-7xl">
              Someone cancelled.
              <br />
              <em className="text-gold-light">How fortunate.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-paper/70">
              A private collection of last-minute reservations, quietly released by the city's most discerning establishments. Tables, treatments and appointments that were never meant to be available. Until now.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button variant="gold" size="lg" onClick={surprise}>
                Indulge me
              </Button>
              <Button variant="light" size="lg" onClick={() => go('/wants')}>
                Notify me discreetly
              </Button>
            </div>
          </div>
          <Mascot className="h-48 w-40 self-center sm:h-64 sm:w-56" />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="eyebrow text-gold">The Collection</p>
          <h2 className="font-display text-4xl">Currently available</h2>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={categories.length === 0} onClick={() => setCategories([])}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)}>
              {CATEGORY_META[c].label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-4">
          <Segmented value={window} onChange={setWindow} options={(['now', 'today', '48h'] as TimeWindow[]).map((w) => ({ value: w, label: WINDOW_META[w].label }))} />
          <label className="flex items-center gap-3">
            <span className="eyebrow text-stone">Order by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="cursor-pointer border-b border-ink/30 bg-transparent py-1 font-display text-lg italic outline-none">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="font-display text-lg italic text-stone">
          {list.length} reservation{list.length === 1 ? '' : 's'} presently available
        </p>
      </section>

      {list.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <LastCallCard key={s.id} state={state} slot={s} now={now} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 border border-ink/10 bg-ivory px-6 py-20 text-center">
          <p className="eyebrow text-gold">Nothing at present</p>
          <h3 className="font-display text-4xl">Nothing worthy of you, yet.</h3>
          <p className="max-w-md text-ink/60">Perhaps broaden your criteria. Or leave a Want with us, and we shall inform you the moment something suitable is released.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setCategories([])
                setWindow(null)
              }}
            >
              View all
            </Button>
            <Button onClick={() => go('/wants')}>Leave a Want</Button>
          </div>
        </div>
      )}
    </div>
  )
}
