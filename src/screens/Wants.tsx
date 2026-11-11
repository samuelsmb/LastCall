import { useState } from 'react'
import { CATEGORIES, CATEGORY_META, WINDOW_META } from '../domain/categories'
import { businessOf, interpretWant, isLive, matchesWant } from '../domain/selectors'
import { addWant, markAlertSeen, removeWant, useAppState } from '../domain/store'
import type { Category, TimeWindow } from '../domain/types'
import { go, useNow, when } from '../lib'
import { Button, Chip, Mascot, Segmented } from '../ui'

export function Wants() {
  const state = useAppState()
  const now = useNow()
  const [label, setLabel] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [window, setWindow] = useState<TimeWindow | null>('48h')
  const [touched, setTouched] = useState(false)

  const guess = interpretWant(label)
  const onLabel = (text: string) => {
    setLabel(text)
    if (touched) return
    const g = interpretWant(text)
    setCategories(g.categories)
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
    addWant(label.trim() || `${fallback}, ${WINDOW_META[window].hint}`, categories, window)
    setLabel('')
    setCategories([])
    setWindow('48h')
    setTouched(false)
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-8 border border-ink/10 bg-ivory p-8 sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow text-gold">Your Wants</p>
              <h1 className="mt-3 font-display text-5xl leading-[1.05]">
                Tell us what you desire.
                <br />
                <em className="text-ink/60">We shall see to it.</em>
              </h1>
            </div>
            <Mascot className="hidden h-28 w-24 shrink-0 sm:inline-block" />
          </div>
          <input
            value={label}
            onChange={(e) => onLabel(e.target.value)}
            placeholder="A tyre change within 48 hours, naturally."
            className="border-b border-ink/30 bg-transparent py-3 font-display text-3xl outline-none placeholder:italic placeholder:text-ink/30 focus:border-gold"
          />
          {label && !touched && (
            <p className="animate-fade font-display text-lg italic text-gold">
              {guess.categories.length ? (
                <>
                  Understood: {guess.categories.map((c) => CATEGORY_META[c].label).join(', ')}
                  {guess.window && `, ${WINDOW_META[guess.window].hint}`}.
                </>
              ) : (
                <>Do indicate a category below, and we shall learn your tastes.</>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)}>
                {CATEGORY_META[c].label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Segmented
              value={window}
              onChange={(w) => {
                setTouched(true)
                setWindow(w)
              }}
              options={(['now', 'today', '48h'] as TimeWindow[]).map((w) => ({ value: w, label: WINDOW_META[w].label }))}
            />
            <Button onClick={save} disabled={!canSave}>
              Leave this Want
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-3xl">Standing Wants</h2>
          {state.wants.length === 0 && <p className="font-display text-lg italic text-stone">None as yet. “Fine dining this evening” is a popular choice among our members.</p>}
          <div className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
            {state.wants.map((w) => {
              const matches = state.slots.filter((s) => isLive(s, now) && matchesWant(state, s, w, now)).length
              return (
                <div key={w.id} className="flex items-center gap-6 py-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl italic">“{w.label}”</p>
                    <p className="eyebrow mt-1 text-stone">
                      {w.categories.map((c) => CATEGORY_META[c].label).join(' · ')} · {WINDOW_META[w.window].hint}
                    </p>
                    {matches > 0 && (
                      <p className="mt-2 text-sm text-gold">
                        {matches} reservation{matches === 1 ? '' : 's'} currently suit{matches === 1 ? 's' : ''} this Want
                      </p>
                    )}
                  </div>
                  <button onClick={() => removeWant(w.id)} className="eyebrow cursor-pointer text-stone transition hover:text-oxblood">
                    Withdraw
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <p className="eyebrow text-gold">Correspondence</p>
        <h2 className="font-display text-3xl">Alerts</h2>
        {state.alerts.length === 0 && (
          <div className="border border-ink/10 bg-ivory p-10 text-center">
            <p className="font-display text-2xl italic">All is quiet.</p>
            <p className="mt-2 text-sm text-stone">Should an establishment release something in accordance with your Wants, you will find it here.</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
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
                className={`flex cursor-pointer flex-col gap-1 border p-5 text-left transition hover:border-ink/40 ${a.seen ? 'border-ink/10 bg-ivory' : 'border-gold/60 bg-ivory'} ${live ? '' : 'opacity-45'}`}
              >
                <span className="flex items-center gap-2">
                  {!a.seen && <span className="h-1.5 w-1.5 rounded-full bg-oxblood" />}
                  <span className="eyebrow text-stone">
                    {biz.name} · {biz.neighbourhood}
                  </span>
                </span>
                <span className="font-display text-2xl">{slot.title}</span>
                <span className="text-sm text-ink/60">
                  {when(slot.start, now)}
                  {live ? '' : ' · no longer available'}
                </span>
                {want && <span className="font-display italic text-gold">In accordance with “{want.label}”</span>}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
