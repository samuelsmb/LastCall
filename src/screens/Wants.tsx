import { useState } from 'react'
import { alertLine } from '../components/AlertToasts'
import { CATEGORIES, CATEGORY_META, WINDOW_META } from '../domain/categories'
import { businessOf, interpretWant, isLive, matchesWant } from '../domain/selectors'
import { addWant, markAlertSeen, removeWant, useAppState } from '../domain/store'
import type { Category, TimeWindow } from '../domain/types'
import { go, useNow } from '../lib'
import { Button, Chip, Mascot, Segmented } from '../ui'

export function Wants({ initialText = '' }: { initialText?: string }) {
  const state = useAppState()
  const now = useNow()
  const initial = interpretWant(initialText)
  const [label, setLabel] = useState(initialText)
  const [categories, setCategories] = useState<Category[]>(initial.categories)
  const [window, setWindow] = useState<TimeWindow | null>(initial.window ?? '48h')
  const [area, setArea] = useState<string | null>(initial.area)
  const [touched, setTouched] = useState(false)

  const guess = interpretWant(label)
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
    const fallback = categories.map((c) => CATEGORY_META[c].label).join(' or ')
    addWant(label.trim() || `${fallback} ${WINDOW_META[window].hint}`, categories, window, area ?? undefined)
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
              <h1 className="heading-1">What do you need?</h1>
              <p className="mt-2 text-muted">Tell us, and we'll alert you the moment a matching Last Call is released.</p>
            </div>
            <Mascot className="hidden text-6xl sm:inline-block" />
          </div>
          <input
            value={label}
            onChange={(e) => onLabel(e.target.value)}
            placeholder="e.g. tyre change within 48h near Majorstuen"
            className="rounded border border-[#ddd] bg-canvas px-3 py-2.5 text-base outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30"
          />
          {label && !touched && (
            <p className="flex animate-fade items-center gap-2 text-[15px] text-ink-2">
              <span className="rounded bg-purple/40 px-1.5 text-purple-deep">✦ AI</span>
              {guess.categories.length ? (
                <>
                  Detected {guess.categories.map((c) => CATEGORY_META[c].label).join(', ')}
                  {guess.window && `, ${WINDOW_META[guess.window].hint}`}
                  {guess.area && `, near ${guess.area}`}
                </>
              ) : (
                <>Not sure yet. Pick a category below.</>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              value={window}
              onChange={(w) => {
                setTouched(true)
                setWindow(w)
              }}
              options={(['now', 'today', '48h'] as TimeWindow[]).map((w) => ({ value: w, label: WINDOW_META[w].label }))}
            />
            <Button onClick={save} disabled={!canSave}>
              Save Want
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="heading-2">Your Wants</h2>
          {state.wants.length === 0 && <p className="text-muted">No Wants yet. Try “fine dining tonight” or “tyres within 48 hours”.</p>}
          {state.wants.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-hairline bg-canvas">
              {state.wants.map((w) => {
                const matches = state.slots.filter((s) => isLive(s, now) && matchesWant(state, s, w, now)).length
                return (
                  <div key={w.id} className="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-b-0">
                    <span className="text-xl">{CATEGORY_META[w.categories[0]].icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{w.label}</p>
                      <p className="text-sm text-muted">
                        {w.categories.map((c) => CATEGORY_META[c].label).join(', ')} · {WINDOW_META[w.window].hint}
                        {w.area && ` · near ${w.area}`}
                        {matches > 0 && <span className="text-primary"> · {matches} matching now</span>}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeWant(w.id)}>
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="heading-2">Alerts</h2>
        {state.alerts.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-canvas px-6 py-12 text-center">
            <span className="text-4xl">📭</span>
            <p className="title">No alerts yet</p>
            <p className="text-sm text-muted">When a business releases a Last Call that matches one of your Wants, it shows up here.</p>
          </div>
        )}
        {state.alerts.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-hairline bg-canvas">
            {state.alerts.map((a) => {
              const slot = state.slots.find((s) => s.id === a.slotId)
              const want = state.wants.find((w) => w.id === a.wantId)
              if (!slot) return null
              const biz = businessOf(state, slot)
              const live = isLive(slot, now)
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    markAlertSeen(a.id)
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
                      {live ? '' : ' · no longer available'}
                    </span>
                    {want && <span className="block text-sm text-ink-2">Matched “{want.label}”</span>}
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
