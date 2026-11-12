import type { ModelMessage } from 'ai'
import { useEffect, useRef, useState } from 'react'
import type { AssistantTurn } from '../domain/assistant'
import type { OfferedWant } from '../domain/fastAssistant'
import { useAppState } from '../domain/store'
import { useNow } from '../lib'
import { Button } from '../ui'
import { LastCallCard } from './LastCallCard'

const hasAssistantKey = Boolean(import.meta.env.VITE_OPENROUTER_KEY)

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  slotIds?: string[]
}

const SUGGESTIONS = ['Vis meg noe jeg vil like', 'Overrask meg i kveld', 'Middagsplaner i kveld', 'Hva skjer i dag?', 'Varsle meg om ting jeg vil like']

/** The Customer's chat helper: a bubble in the corner that opens a chat panel. */
export function Assistant() {
  const state = useAppState()
  const now = useNow()
  const [open, setOpen] = useState(false)
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [history, setHistory] = useState<ModelMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [offered, setOffered] = useState<OfferedWant | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [chat, busy, open])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setInput('')
    setChat((c) => [...c, { role: 'user', text: trimmed }])
    if (!hasAssistantKey) {
      setChat((c) => [...c, { role: 'assistant', text: 'Assistenten er ikke satt opp her ennå (mangler API-nøkkel).' }])
      return
    }
    setBusy('Tenker …')
    try {
      let turn: AssistantTurn | null = null
      const { askFast } = await import('../domain/fastAssistant')
      const fastTurn = await askFast(history, trimmed, offered).catch((e) => (console.error(e), null))
      setOffered(fastTurn?.offered ?? null)
      turn = fastTurn
      if (!turn) {
        setBusy('Tenker grundigere …')
        const { askAssistant } = await import('../domain/assistant')
        turn = await askAssistant(history, trimmed)
      }
      setHistory(turn.messages)
      setChat((c) => [...c, { role: 'assistant', text: turn.reply, slotIds: turn.slotIds }])
    } catch (e) {
      console.error(e)
      setChat((c) => [...c, { role: 'assistant', text: 'Beklager, noe gikk galt. Prøv igjen om litt.' }])
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(560px,calc(100vh-8rem))] flex-col overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-lifted sm:inset-x-auto sm:right-6 sm:w-[400px]">
          <div className="flex items-center justify-between gap-2 border-b border-hairline px-4 py-3">
            <p className="flex items-center gap-2 font-semibold">
              <img src={`${import.meta.env.BASE_URL}img/favicon.svg`} alt="" className="h-6 w-6" /> Assistent
            </p>
            <button className="cursor-pointer rounded-md px-1.5 text-lg leading-none text-faint hover:bg-black/5 hover:text-ink" onClick={() => setOpen(false)} aria-label="Lukk">
              ×
            </button>
          </div>

          <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {chat.length === 0 && (
              <>
                <p className="text-ink-2">Hei! Jeg kan finne Last Calls, anbefale noe du vil like, eller varsle deg når noe dukker opp.</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="cursor-pointer rounded-full border border-hairline px-3 py-1.5 text-sm hover:bg-black/5">
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            {chat.map((m, i) =>
              m.role === 'user' ? (
                <p key={i} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-white">
                  {m.text}
                </p>
              ) : (
                <div key={i} className="flex flex-col gap-2">
                  {m.text && <p className="max-w-[90%] rounded-2xl rounded-bl-md bg-paper px-3.5 py-2">{m.text}</p>}
                  {m.slotIds?.map((id) => {
                    const slot = state.slots.find((s) => s.id === id)
                    return slot ? <LastCallCard key={id} state={state} slot={slot} now={now} compact onOpen={() => setOpen(false)} /> : null
                  })}
                </div>
              ),
            )}
            {busy && <p className="animate-pulse text-faint">{busy}</p>}
          </div>

          <form
            className="flex gap-2 border-t border-hairline p-3"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Spør om hva som helst …"
              className="min-w-0 flex-1 rounded border border-[#ddd] bg-canvas px-3 py-2 text-base outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30"
            />
            <Button type="submit" size="sm" disabled={!!busy || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-white shadow-lifted transition hover:scale-105"
        aria-label="Åpne assistenten"
      >
        <img src={`${import.meta.env.BASE_URL}img/favicon.svg`} alt="" className="h-6 w-6" /> {open ? 'Lukk' : 'Assistent'}
      </button>
    </>
  )
}
