import { ArrowRight, Bell, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { LastCallCard } from '../components/LastCallCard'
import { HeroSlideshow } from '../components/HeroSlideshow'
import { CATEGORIES, CATEGORY_META, WINDOW_META } from '../domain/categories'
import { isLive, marketplace, matchesWant, SORTS, type SortKey } from '../domain/selectors'
import { CITY } from '../brand'
import { useAppState } from '../domain/store'
import type { Category, TimeWindow } from '../domain/types'
import { go, useNow } from '../lib'
import { Button, CategoryIcon, Chip, Segmented } from '../ui'

export function Marketplace() {
  const state = useAppState()
  const now = useNow()
  const [categories, setCategories] = useState<Category[]>([])
  const [window, setWindow] = useState<TimeWindow | null>(null)
  const [sort, setSort] = useState<SortKey>('soonest')

  const list = useMemo(() => marketplace(state, now, { categories, window, sort }), [state, now, categories, window, sort])

  const wantMatches = useMemo(
    () => state.slots.filter((s) => isLive(s, now) && state.wants.some((w) => matchesWant(state, s, w, now))),
    [state, now],
  )

  const toggle = (c: Category) => setCategories(categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c])

  return (
    <div className="flex flex-col gap-10">
      <section className="marketplace-hero relative isolate overflow-hidden rounded-2xl text-ink">
        <div className="marketplace-hero-layout relative grid items-center">
          <div className="relative z-10">
            <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-1.3px] sm:text-[48px] lg:text-[54px] lg:tracking-[-1.875px]">
              Noen avbestilte.<br />Nå er den din!
            </h1>
            <p className="mt-2 max-w-[440px] text-base leading-relaxed lg:text-lg">
              Fullbooka bord og verksteder i {CITY}, ledige i det øyeblikket noen avbestiller. Hopp over køen, noen ganger til lavere pris. Rimelig i siste liten.
            </p>
            <div className="mt-8 lg:mt-12">
              <button
                type="button"
                className="inline-flex min-h-11 min-w-[239px] cursor-pointer items-center justify-center rounded-full bg-[#f9e321] px-8 py-2 text-xl font-semibold text-black transition-[background-color,box-shadow,transform] duration-200 hover:bg-[#efd20b] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d0b33] active:translate-y-0 active:bg-[#e2c500] active:shadow-none motion-reduce:transition-none"
                onClick={() => {
                  const heading = document.getElementById('ledig-na')
                  heading?.scrollIntoView({ block: 'start' })
                  heading?.focus({ preventScroll: true })
                }}
              >
                Finn et Last Call
              </button>
            </div>
          </div>
          <div className="marketplace-hero-art w-full justify-self-center">
            <HeroSlideshow />
          </div>
        </div>
      </section>

      {wantMatches.length > 0 && (
        <button
          type="button"
          onClick={() => go('/wants')}
          className="-mt-4 flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-pink/40 bg-pink/10 px-5 py-4 text-left transition hover:bg-pink/20"
        >
          <Bell className="h-6 w-6 shrink-0 animate-twinkle text-pink" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">
              {wantMatches.length} {wantMatches.length === 1 ? 'Last Call passer' : 'Last Calls passer'} ønskene dine nå
            </span>
            <span className="block text-sm text-ink-2">Noe du har ønsket deg har blitt ledig. Se hva som passer.</span>
          </span>
          <span className="font-semibold text-primary">Se treff <ArrowRight className="inline h-4 w-4 align-[-3px]" aria-hidden /></span>
        </button>
      )}

      <section className="flex flex-col gap-4">
        <h2 id="ledig-na" tabIndex={-1} className="heading-1 scroll-mt-24">Ledig nå</h2>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={categories.length === 0} onClick={() => setCategories([])}>
            Alle
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)}>
              <CategoryIcon category={c} /> {CATEGORY_META[c].label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Segmented value={window} onChange={setWindow} options={(['now', 'today', '48h'] as TimeWindow[]).map((w) => ({ value: w, label: WINDOW_META[w].label }))} />
            <span className="hidden text-[15px] text-muted sm:inline">
              {list.length} {list.length === 1 ? 'Last Call' : 'Last Calls'}
            </span>
          </div>
          <label className="flex items-center gap-2 text-[15px] text-muted">
            Sorter etter
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
          <SearchX className="h-12 w-12 text-faint" aria-hidden />
          <h3 className="heading-2">Ingenting passer akkurat nå</h3>
          <p className="max-w-md text-muted">Prøv et videre filter, eller opprett et ønske så gir vi beskjed så snart noe åpner seg.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button
              variant="utility"
              onClick={() => {
                setCategories([])
                setWindow(null)
              }}
            >
              Fjern filtre
            </Button>
            <Button onClick={() => go('/wants')}>Opprett et ønske</Button>
          </div>
        </div>
      )}
    </div>
  )
}
