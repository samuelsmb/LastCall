import { useEffect, useRef, useState } from 'react'
import { alertLine } from '../components/AlertToasts'
import type { WantGuess } from '../domain/assistant'
import { CATEGORIES, CATEGORY_META, wantWindowHint } from '../domain/categories'
import { businessOf, interpretWant, isLive, matchesWant, slotComparator, SORTS, type SortKey } from '../domain/selectors'
import { addWant, markAlertSeen, removeWant, useAppState } from '../domain/store'
import type { Category, WantWindow } from '../domain/types'
import { go, useNow } from '../lib'
import { Button, CategoryIcon, Chip, Mascot, PinIcon } from '../ui'

const hasModelKey = Boolean(import.meta.env.VITE_OPENROUTER_KEY)

export function Wants({ initialText = '' }: { initialText?: string }) {
  const state = useAppState()
  const now = useNow()
  const initial = interpretWant(initialText)
  const [label, setLabel] = useState(initialText)
  const [categories, setCategories] = useState<Category[]>(initial.categories)
  const [window, setWindow] = useState<WantWindow | null>(initial.window ?? '48h')
  const [area, setArea] = useState<string | null>(initial.area)
  const [touched, setTouched] = useState(false)
  const [sort, setSort] = useState<SortKey>('soonest')
  const [guess, setGuess] = useState<WantGuess | null>(initialText ? initial : null)
  const [thinking, setThinking] = useState(false)

  const apply = (g: WantGuess) => {
    setGuess(g)
    setCategories(g.categories)
    setArea(g.area)
    setWindow(g.window ?? '48h')
  }

  // Leser teksten med språkmodellen når kunden tar en pause; nøkkelordtolkningen gjelder til svaret kommer.
  useEffect(() => {
    const text = label.trim()
    if (!text || touched || !hasModelKey) return setThinking(false)
    const ctrl = new AbortController()
    setThinking(true)
    const timer = setTimeout(async () => {
      try {
        const { interpretWantWithModel } = await import('../domain/assistant')
        const g = await interpretWantWithModel(text, ctrl.signal)
        if (!ctrl.signal.aborted) apply(g)
      } catch (e) {
        if (!ctrl.signal.aborted) console.error(e)
      } finally {
        if (!ctrl.signal.aborted) setThinking(false)
      }
    }, 600)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [label, touched])

  // Varsler: lagrede varsler, pluss live treff på ønsker som ennå ikke har et varsel.
  const alertSlotIds = new Set(state.alerts.map((a) => a.slotId))
  const items = [
    ...state.alerts.map((a) => ({ id: a.id, slotId: a.slotId, want: state.wants.find((w) => w.id === a.wantId), seen: a.seen, alertId: a.id as string | null })),
    ...state.slots
      .filter((s) => isLive(s, now) && !alertSlotIds.has(s.id))
      .flatMap((s) => {
        const w = state.wants.find((x) => matchesWant(state, s, x, now))
        return w ? [{ id: `match-${s.id}`, slotId: s.id, want: w, seen: false, alertId: null as string | null }] : []
      }),
  ]

  // Nye varsler dukker opp ett og ett med litt forsinkelse, som om de ble funnet etter at ønsket ble lagret.
  const [shown, setShown] = useState(() => new Set(items.map((i) => i.id)))
  const scheduled = useRef(new Set<string>())
  const itemKey = items.map((i) => i.id).join('|')
  useEffect(() => {
    const fresh = items.filter((i) => !shown.has(i.id) && !scheduled.current.has(i.id))
    fresh.forEach((i, n) => {
      scheduled.current.add(i.id)
      setTimeout(() => setShown((s) => new Set(s).add(i.id)), 900 + n * 700)
    })
  }, [itemKey])
  const compare = slotComparator(state, sort)
  const slotOf = (id: string) => state.slots.find((s) => s.id === id)
  const visible = items
    .filter((i) => shown.has(i.id))
    .sort((a, b) => {
      const sa = slotOf(a.slotId)
      const sb = slotOf(b.slotId)
      return sa && sb ? compare(sa, sb) : 0
    })
  const pending = items.length - visible.length

  const onLabel = (text: string) => {
    setLabel(text)
    if (touched) return
    if (!text.trim()) return apply({ categories: [], window: null, area: null })
    apply(interpretWant(text))
  }

  const toggle = (c: Category) => {
    setTouched(true)
    setCategories(categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c])
  }

  const [saving, setSaving] = useState(false)
  const canSave = !saving && (categories.length > 0 || (hasModelKey && label.trim().length > 0))
  const save = async () => {
    if (!canSave) return
    let cats = categories
    let win = window ?? '48h'
    let where = area
    let title = touched ? undefined : guess?.label
    // Har ikke språkmodellen svart ennå, venter vi på den, så ønsket får riktig tid og en ryddig tittel.
    if (hasModelKey && label.trim() && !touched && !title) {
      setSaving(true)
      try {
        const { interpretWantWithModel } = await import('../domain/assistant')
        const g = await interpretWantWithModel(label.trim())
        apply(g)
        if (g.categories.length) {
          cats = g.categories
          win = g.window ?? '48h'
          where = g.area
          title = g.label
        }
      } catch (e) {
        console.error(e)
      } finally {
        setSaving(false)
      }
    }
    if (!cats.length) return
    const fallback = cats.map((c) => CATEGORY_META[c].label).join(' eller ')
    addWant(title || label.trim() || `${fallback} ${wantWindowHint(win)}`, cats, win, where ?? undefined)
    setLabel('')
    setCategories([])
    setWindow('48h')
    setArea(null)
    setTouched(false)
    setGuess(null)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-5 rounded-2xl border border-hairline bg-canvas p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="heading-1">Hva ønsker du?</h1>
              <p className="mt-2 text-muted">Si fra, så varsler vi deg i det øyeblikket en passende Last Call frigis.</p>
            </div>
            <Mascot className="hidden text-6xl sm:inline-block" />
          </div>
          <input
            value={label}
            onChange={(e) => onLabel(e.target.value)}
            placeholder="f.eks. dekkskift innen 48 timer nær Alna, eller restaurant i kveld"
            className="rounded border border-[#ddd] bg-canvas px-3 py-2.5 text-base outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30"
          />
          {label.trim() && !touched && guess && (
            <p className="flex animate-fade items-center gap-2 text-[15px] text-ink-2">
              <span className="rounded bg-purple/40 px-1.5 text-purple-deep">✦ AI</span>
              {thinking ? (
                <span className="animate-pulse text-faint">Tolker …</span>
              ) : guess.categories.length ? (
                <>
                  {guess.label && <strong className="font-semibold text-ink">«{guess.label}»</strong>}
                  {guess.label ? ' · ' : 'Gjenkjente '}
                  {guess.categories.map((c) => CATEGORY_META[c].label).join(', ')}
                  {`, ${wantWindowHint(guess.window ?? '48h')}`}
                  {guess.area && `, nær ${guess.area}`}
                </>
              ) : (
                <>Usikker ennå. Velg en kategori under.</>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)}>
                <CategoryIcon category={c} /> {CATEGORY_META[c].label}
              </Chip>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={!canSave}>
              {saving ? 'Tolker …' : 'Lagre ønske'}
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="heading-2">Dine ønsker</h2>
          {state.wants.length === 0 && <p className="text-muted">Ingen ønsker ennå. Prøv «restaurant i kveld» eller «dekkskift innen 48 timer».</p>}
          {state.wants.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-hairline bg-canvas">
              {state.wants.map((w) => {
                const matching = state.slots.filter((s) => isLive(s, now) && matchesWant(state, s, w, now))
                const matches = matching.length
                const followed = w.businessId ? state.businesses.find((b) => b.id === w.businessId) : undefined
                return (
                  <div key={w.id} className="border-b border-hairline last:border-b-0">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <CategoryIcon category={w.categories[0]} className="h-5 w-5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{w.label}</p>
                      <p className="text-sm text-muted">
                        {followed ? `Følger ${followed.name}` : w.categories.map((c) => CATEGORY_META[c].label).join(', ')} · {wantWindowHint(w.window)}
                        {w.area && ` · nær ${w.area}`}
                      </p>
                    </div>
                    {matches > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        <span className="h-2 w-2 animate-twinkle rounded-full bg-primary" />
                        {matches} passer nå
                      </span>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => removeWant(w.id)}>
                      Fjern
                    </Button>
                  </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="heading-2">Varsler</h2>
          {items.length > 1 && (
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
          )}
        </div>
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-canvas px-6 py-12 text-center">
            <span className="text-4xl">📭</span>
            <p className="title">Ingen varsler ennå</p>
            <p className="text-sm text-muted">Når en bedrift frigir en Last Call som passer et av ønskene dine, dukker den opp her.</p>
          </div>
        )}
        {visible.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-hairline bg-canvas">
            {visible.map((a) => {
              const slot = state.slots.find((s) => s.id === a.slotId)
              const want = a.want
              if (!slot) return null
              const biz = businessOf(state, slot)
              const live = isLive(slot, now)
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    if (a.alertId) markAlertSeen(a.alertId)
                    go(`/lc/${slot.id}`)
                  }}
                  className={`flex w-full animate-rise cursor-pointer items-start gap-3 border-b border-hairline px-4 py-3 text-left transition last:border-b-0 hover:bg-paper ${live ? '' : 'opacity-50'}`}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: a.seen ? 'transparent' : 'var(--color-primary)' }} />
                  <CategoryIcon category={biz.category} className="h-5 w-5" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{alertLine(state, slot, now)}</span>
                    <span className="block text-sm text-muted">
                      <PinIcon className="mr-1 h-3.5 w-3.5 align-[-2px]" />
                      {biz.neighbourhood}
                      {live ? '' : ' · ikke lenger tilgjengelig'}
                    </span>
                    {want && <span className="block text-sm text-ink-2">Passet «{want.label}»</span>}
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {pending > 0 && (
          <p className="flex animate-fade items-center gap-2 text-sm text-muted">
            <span className="h-2 w-2 animate-twinkle rounded-full bg-primary" />
            Leter etter treff …
          </p>
        )}
      </section>
    </div>
  )
}
