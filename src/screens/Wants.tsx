import { useState } from 'react'
import { alertLine } from '../components/AlertToasts'
import { CATEGORIES, CATEGORY_META, WANT_WINDOW_META } from '../domain/categories'
import { businessOf, interpretWant, isLive, matchesWant } from '../domain/selectors'
import { addWant, markAlertSeen, removeWant, useAppState } from '../domain/store'
import type { Category, WantWindow } from '../domain/types'
import { go, useNow } from '../lib'
import { Button, Chip, Mascot } from '../ui'

export function Wants({ initialText = '' }: { initialText?: string }) {
  const state = useAppState()
  const now = useNow()
  const initial = interpretWant(initialText)
  const [label, setLabel] = useState(initialText)
  const [categories, setCategories] = useState<Category[]>(initial.categories)
  const [window, setWindow] = useState<WantWindow | null>(initial.window ?? '48h')
  const [area, setArea] = useState<string | null>(initial.area)
  const [touched, setTouched] = useState(false)

  const guess = interpretWant(label)

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
  const onLabel = (text: string) => {
    setLabel(text)
    if (touched) return
    const g = interpretWant(text)
    setCategories(g.categories)
    setArea(g.area)
    if (g.window) setWindow(g.window)
  }

  const toggle = (c: Category) => {
    setTouched(true)
    setCategories(categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c])
  }

  const canSave = categories.length > 0 && window
  const save = () => {
    if (!canSave) return
    const fallback = categories.map((c) => CATEGORY_META[c].label).join(' eller ')
    addWant(label.trim() || `${fallback} ${WANT_WINDOW_META[window].hint}`, categories, window, area ?? undefined)
    setLabel('')
    setCategories([])
    setWindow('48h')
    setArea(null)
    setTouched(false)
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
          {label && (
            <p className="flex animate-fade items-center gap-2 text-[15px] text-ink-2">
              <span className="rounded bg-purple/40 px-1.5 text-purple-deep">✦ AI</span>
              {guess.categories.length ? (
                <>
                  Gjenkjente {guess.categories.map((c) => CATEGORY_META[c].label).join(', ')}
                  {guess.window && `, ${WANT_WINDOW_META[guess.window].hint}`}
                  {guess.area && `, nær ${guess.area}`}
                </>
              ) : (
                <>Usikker ennå. Velg en kategori under, eller si hva du ønsker.</>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)}>
                <span>{CATEGORY_META[c].icon}</span> {CATEGORY_META[c].label}
              </Chip>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={!canSave}>
              Lagre ønske
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
                    <span className="text-xl">{CATEGORY_META[w.categories[0]].icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{w.label}</p>
                      <p className="text-sm text-muted">
                        {followed ? `Følger ${followed.name}` : w.categories.map((c) => CATEGORY_META[c].label).join(', ')} · {WANT_WINDOW_META[w.window].hint}
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
        <h2 className="heading-2">Varsler</h2>
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-canvas px-6 py-12 text-center">
            <span className="text-4xl">📭</span>
            <p className="title">Ingen varsler ennå</p>
            <p className="text-sm text-muted">Når en bedrift frigir en Last Call som passer et av ønskene dine, dukker den opp her.</p>
          </div>
        )}
        {items.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-hairline bg-canvas">
            {items.map((a) => {
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
                  className={`flex w-full cursor-pointer items-start gap-3 border-b border-hairline px-4 py-3 text-left transition last:border-b-0 hover:bg-paper ${live ? '' : 'opacity-50'}`}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: a.seen ? 'transparent' : 'var(--color-primary)' }} />
                  <span className="text-xl">{CATEGORY_META[biz.category].icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{alertLine(state, slot, now)}</span>
                    <span className="block text-sm text-muted">
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
      </section>
    </div>
  )
}
