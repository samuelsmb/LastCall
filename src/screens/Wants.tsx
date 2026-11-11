import { useState } from 'react'
import { CATEGORIES, CATEGORY_META, WINDOW_META } from '../domain/categories'
import { businessOf, interpretWant, isLive, matchesWant } from '../domain/selectors'
import { addWant, markAlertSeen, removeWant, useAppState } from '../domain/store'
import type { Category, TimeWindow } from '../domain/types'
import { go, useNow, when } from '../lib'
import { Button, Card, Chip, Mascot, Segmented } from '../ui'

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
    addWant(label.trim() || `${fallback} ${WINDOW_META[window].hint}`, categories, window)
    setLabel('')
    setCategories([])
    setWindow('48h')
    setTouched(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5 bg-sunny p-6">
          <div className="flex items-center gap-4">
            <Mascot size="text-6xl" />
            <div>
              <h1 className="font-display text-3xl font-bold leading-tight">What are you after?</h1>
              <p className="text-ink/70">Tell us, and we'll ring the bell the moment someone cancels.</p>
            </div>
          </div>
          <input
            value={label}
            onChange={(e) => onLabel(e.target.value)}
            placeholder="e.g. I need to change my tyres in the next 48h"
            className="rounded-2xl border-[3px] border-ink bg-white px-4 py-3 text-lg outline-none"
          />
          {label && !touched && (
            <p className="animate-pop font-display text-sm font-semibold">
              {guess.categories.length ? (
                <>✨ Got it: {guess.categories.map((c) => `${CATEGORY_META[c].emoji} ${CATEGORY_META[c].label}`).join(', ')}{guess.window && ` · ${WINDOW_META[guess.window].hint}`}</>
              ) : (
                <>🤔 Hmm, pick a category below and I'll learn.</>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={categories.includes(c)} onClick={() => toggle(c)}>
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
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
              🔔 Save Want
            </Button>
          </div>
        </Card>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold">My Wants</h2>
          {state.wants.length === 0 && <p className="text-ink/60">No Wants yet. Try “fine dining tonight” or “tyres within 48h”.</p>}
          {state.wants.map((w) => {
            const matches = state.slots.filter((s) => isLive(s, now) && matchesWant(state, s, w, now)).length
            return (
              <Card key={w.id} className="flex items-center gap-4 p-4">
                <span className="text-3xl">{CATEGORY_META[w.categories[0]].emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold leading-tight">“{w.label}”</p>
                  <p className="text-sm text-ink/60">
                    {w.categories.map((c) => CATEGORY_META[c].label).join(', ')} · {WINDOW_META[w.window].hint}
                  </p>
                  {matches > 0 && (
                    <p className="text-sm font-semibold text-grape">
                      👀 {matches} live Last Call{matches === 1 ? '' : 's'} match right now
                    </p>
                  )}
                </div>
                <button onClick={() => removeWant(w.id)} className="cursor-pointer rounded-full p-2 text-xl hover:bg-ink/5" aria-label="Remove Want">
                  🗑️
                </button>
              </Card>
            )
          })}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-bold">Alerts 🔔</h2>
        {state.alerts.length === 0 && (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <span className="animate-float text-5xl">📭</span>
            <p className="font-display font-semibold">Quiet… for now.</p>
            <p className="text-sm text-ink/60">When a Business releases a Last Call that matches your Want, it lands here.</p>
          </Card>
        )}
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
              className={`flex cursor-pointer items-start gap-3 rounded-3xl border-[3px] border-ink p-4 text-left shadow-chunky-sm transition hover:-translate-y-0.5 ${a.seen ? 'bg-white' : 'bg-bubble/30'} ${live ? '' : 'opacity-50'}`}
            >
              <span className="text-3xl">{biz.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-bold">
                  {!a.seen && <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-tomato" />}
                  {biz.name}: {slot.title}
                </span>
                <span className="block text-sm text-ink/60">
                  {when(slot.start, now)} · 📍 {biz.neighbourhood} {live ? '' : '· gone'}
                </span>
                {want && <span className="block text-xs font-semibold text-grape">✨ Matched “{want.label}”</span>}
              </span>
            </button>
          )
        })}
      </section>
    </div>
  )
}
