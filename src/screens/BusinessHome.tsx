import { useEffect, useRef, useState } from 'react'
import { CATEGORY_META } from '../domain/categories'
import { calculateFee, cancellerBonus, FEE_CAP_PCT, FEE_PER_SPOT, INTRO_SPOTS } from '../domain/pricing'
import { dashboardStats, DEFAULT_RULE, lastCallPrice, releaseTime } from '../domain/selectors'
import { cancelSlot, releaseSlot, setCurrentBusiness, setRule, useAppState, withdrawSlot } from '../domain/store'
import type { AutoReleaseRule, Business, ReleaseMode, Slot } from '../domain/types'
import { clock, countdown, dayLabel, go, kr, useNow } from '../lib'
import { Button, Modal, Overlay, Segmented } from '../ui'
import { WAITLIST_LINE } from './Register'

const STATUS: Record<Slot['status'], { label: string; pill: string }> = {
  booked: { label: 'Bestilt', pill: 'bg-black/5 text-ink-2' },
  cancelled: { label: 'Avbestilt', pill: 'bg-orange/10 text-orange-deep' },
  held: { label: 'Holdt for full pris', pill: 'bg-purple/30 text-purple-deep' },
  released: { label: 'På LastCall', pill: 'bg-sky/20 text-[#1d5d94]' },
  sold: { label: 'Solgt via LastCall', pill: 'bg-green/10 text-[#13772a]' },
}

export function BusinessHome({ businessId }: { businessId?: string }) {
  const state = useAppState()
  const now = useNow()
  const [releasing, setReleasing] = useState<Slot | null>(null)
  const [toast, setToast] = useState<{ msg: string; sms?: string } | null>(null)

  const biz = state.businesses.find((b) => b.id === (businessId ?? state.currentBusinessId)) ?? state.businesses[0]
  const meta = CATEGORY_META[biz.category]
  const rule = state.rules[biz.id] ?? DEFAULT_RULE
  const stats = dashboardStats(state, biz.id)
  const calendarBusinesses = state.businesses.filter((b) => state.slots.some((s) => s.businessId === b.id && s.customerName))
  const slots = state.slots.filter((s) => s.businessId === biz.id && s.customerName && s.start + s.durationMin * 60_000 > now).sort((a, b) => a.start - b.start)

  const days = new Map<string, Slot[]>()
  for (const s of slots) {
    const d = dayLabel(s.start, now)
    days.set(d, [...(days.get(d) ?? []), s])
  }

  const notify = (msg: string, sms?: string) => {
    setToast({ msg, sms })
    setTimeout(() => setToast(null), sms ? 6000 : 3500)
  }

  // Celebrate sales that arrive from the Customer tab.
  const soldIds = slots.filter((s) => s.status === 'sold').map((s) => s.id)
  const seenSold = useRef<Set<string> | null>(null)
  useEffect(() => {
    const fresh = seenSold.current ? state.slots.filter((s) => s.businessId === biz.id && s.status === 'sold' && !seenSold.current!.has(s.id)) : []
    seenSold.current = new Set(state.slots.filter((s) => s.status === 'sold').map((s) => s.id))
    const sale = fresh[0]
    if (sale) notify(`Ledig time fylt. ${kr(lastCallPrice(sale))} reddet.`, sale.cancellerBonusPct ? `SMS til ${sale.customerName}: «Timen du avbestilte ble solgt videre. Takk for at du sa ifra i tide, du får ${kr(cancellerBonus(sale))} tilbake.»` : undefined)
  }, [soldIds.join(), biz.id])

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-hairline bg-canvas text-4xl shadow-soft">{meta.icon}</span>
        <div className="flex-1">
          <h1 className="heading-1">{biz.name}</h1>
          <p className="mt-1 text-muted">
            {meta.label} · {biz.neighbourhood} · {biz.tagline}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {calendarBusinesses.length > 1 && (
            <select
              value={biz.id}
              onChange={(e) => {
                setCurrentBusiness(e.target.value)
                go(`/biz/${e.target.value}`)
              }}
              className="cursor-pointer rounded-lg border border-hairline bg-canvas px-2.5 py-1.5 text-[15px] font-medium outline-none">
              {calendarBusinesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="utility" size="sm" onClick={() => go('/biz/register')}>
            + Legg til bedrift
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-hairline bg-canvas p-5 sm:col-span-2">
            <p className="eyebrow text-muted">Inntekt berget</p>
            <p key={stats.recovered} className="display-2 mt-2 animate-rise tabular-nums">
              {kr(stats.recovered)}
            </p>
            <p className="mt-2 text-sm text-muted">{stats.recovered ? 'Fra avbestillinger som ellers ville blitt tomme timer.' : 'Ingenting ennå. Din første Last Call er én avbestilling unna.'}</p>
          </div>
          <div className="rounded-xl border border-hairline bg-canvas p-5">
            <p className="eyebrow text-muted">LastCall-gebyr</p>
            <p key={stats.fee} className="heading-2 mt-1 animate-rise tabular-nums">
              {kr(stats.fee)}
            </p>
            {stats.introSpotsLeft > 0 && (
              <p className="mt-2 text-sm text-muted">
                Gratis plasser igjen: <b className="font-semibold text-ink">{stats.introSpotsLeft}/{INTRO_SPOTS}</b>
              </p>
            )}
          </div>
          <div className="rounded-xl border border-hairline bg-canvas p-5">
            <p className="eyebrow text-muted">Netto berget</p>
            <p key={stats.net} className="heading-2 mt-1 animate-rise tabular-nums text-green">
              {kr(stats.net)}
            </p>
            <p className="mt-2 text-sm text-muted">{stats.bonus ? `Berget minus gebyr og ${kr(stats.bonus)} i avbestillingsbonus` : 'Berget minus gebyr'}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Frigitt" value={stats.released} compact />
          <Stat label="Solgt" value={stats.sold} compact />
          <Stat label="Salgsandel" value={`${stats.sellThrough}%`} compact />
        </div>
        <p className="text-sm text-muted">Du betaler bare når vi fyller en time, og bare hvis kunden møter opp. Faktureres månedlig.</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="order-2 flex flex-col gap-4 lg:order-1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="heading-2">Kalender</h2>
            <p className="text-sm text-muted">Bruk «Simuler avbestilling» for å demonstrere en innkommende avbestilling</p>
          </div>
          {[...days.entries()].map(([day, list]) => (
            <div key={day} className="overflow-hidden rounded-xl border border-hairline bg-canvas">
              <h3 className="eyebrow border-b border-hairline bg-paper px-4 py-2 text-muted">{day}</h3>
              {list.map((s) => (
                <SlotRow
                  key={s.id}
                  slot={s}
                  now={now}
                  heldUntil={s.status === 'held' ? releaseTime(state, s) : null}
                  onCancel={() => cancelSlot(s.id)}
                  onRelease={() => setReleasing(s)}
                  onWithdraw={() => withdrawSlot(s.id)}
                />
              ))}
            </div>
          ))}
        </section>

        <aside className="order-1 lg:order-2">
          <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-canvas p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple/40 text-base">⚡</span>
                <h2 className="title">Auto-frigivelse</h2>
              </div>
              <button
                onClick={() => setRule(biz.id, { enabled: !rule.enabled })}
                className={`relative h-6 w-10 cursor-pointer rounded-full transition ${rule.enabled ? 'bg-primary' : 'bg-black/15'}`}
                aria-label="Slå Auto-frigivelse av/på"
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${rule.enabled ? 'left-[18px]' : 'left-0.5'}`} />
              </button>
            </div>
            <Segmented
              value={rule.mode}
              onChange={(m) => m && setRule(biz.id, { mode: m })}
              options={[
                { value: 'full', label: 'Full pris' },
                { value: 'discount', label: 'Rabatt' },
              ]}
            />
            {rule.mode === 'full' ? (
              <p className={`text-[15px] leading-relaxed text-ink-2 ${rule.enabled ? '' : 'opacity-50'}`}>
                Frigi avbestilte timer med en gang til <b className="font-semibold">full pris</b>. Kundene ser dem som <b className="font-semibold">Hopp over køen</b>.
              </p>
            ) : (
              <>
                <p className={`text-[15px] leading-relaxed text-ink-2 ${rule.enabled ? '' : 'opacity-50'}`}>
                  Hold avbestilte timer tilbake for kunder som betaler full pris frem til{' '}
                  <select value={rule.leadMinutes} onChange={(e) => setRule(biz.id, { leadMinutes: Number(e.target.value) })} className="cursor-pointer rounded border border-hairline bg-paper px-1 font-medium outline-none">
                    {[30, 60, 120, 240].map((m) => (
                      <option key={m} value={m}>
                        {m < 60 ? `${m} min` : `${m / 60} ${m === 60 ? 'time' : 'timer'}`}
                      </option>
                    ))}
                  </select>{' '}
                  før de starter, og frigi dem så med <b className="font-semibold">{rule.discountPct} % rabatt</b>.
                </p>
                <input type="range" min={5} max={60} step={5} value={rule.discountPct} onChange={(e) => setRule(biz.id, { discountPct: Number(e.target.value) })} />
              </>
            )}
            <p className="rounded-lg bg-paper p-3 text-sm text-muted">
              {rule.enabled ? 'På: LastCall håndterer avbestillinger for deg automatisk.' : 'Av: du velger hva som frigis og når.'}
            </p>
            <div className="flex flex-col gap-2 border-t border-hairline pt-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-green/15 text-base">🎁</span>
                <h2 className="title">Avbestillingsbonus</h2>
              </div>
              <p className="text-sm text-muted">
                {rule.cancellerBonusPct ? (
                  <>
                    Kunden som avbestiller får <b className="font-semibold text-ink">{rule.cancellerBonusPct} %</b> av salgsprisen tilbake hvis timen blir solgt videre. Da sier flere ifra i stedet for å bare ikke møte opp.
                  </>
                ) : (
                  'Av: kunden som avbestiller får ingenting tilbake.'
                )}
              </p>
              <input type="range" min={0} max={50} step={5} value={rule.cancellerBonusPct} onChange={(e) => setRule(biz.id, { cancellerBonusPct: Number(e.target.value) })} />
            </div>
            <p className="text-sm text-muted">{WAITLIST_LINE}</p>
          </div>
        </aside>
      </div>

      {releasing && (
        <ReleaseDialog
          slot={releasing}
          rule={rule}
          biz={biz}
          onClose={() => setReleasing(null)}
          onRelease={(d) => {
            releaseSlot(releasing.id, d)
            setReleasing(null)
            notify('Frigitt. Kunder med et matchende ønske er varslet.')
          }}
        />
      )}

      {toast && (
        <Overlay>
          <div className="fixed inset-x-3 bottom-6 z-50 mx-auto flex max-w-md animate-rise items-center gap-3 rounded-xl border border-hairline bg-canvas px-4 py-3 shadow-lifted">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green text-sm text-white">✓</span>
            <span className="flex flex-col gap-1.5 text-[15px]">
              {toast.msg}
              {toast.sms && <span className="rounded-lg bg-paper px-3 py-2 text-sm text-ink-2">💬 {toast.sms}</span>}
            </span>
          </div>
        </Overlay>
      )}
    </div>
  )
}

function Stat({ label, value, compact = false }: { label: string; value: number | string; compact?: boolean }) {
  return (
    <div className="rounded-xl border border-hairline bg-canvas p-5">
      <p className="eyebrow text-muted">{label}</p>
      <p key={String(value)} className={`mt-1 animate-rise tabular-nums ${compact ? 'heading-2' : 'display-2 mt-2'}`}>
        {value}
      </p>
    </div>
  )
}

function SlotRow({ slot, now, heldUntil, onCancel, onRelease, onWithdraw }: { slot: Slot; now: number; heldUntil: number | null; onCancel: () => void; onRelease: () => void; onWithdraw: () => void }) {
  const st = STATUS[slot.status]
  return (
    <div className="flex flex-col gap-3 border-b border-hairline px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center">
      <div className="w-14 shrink-0 font-semibold tabular-nums">{clock(slot.start)}</div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{slot.title}</p>
        <p className="text-sm text-muted">
          {slot.status === 'sold' ? `${slot.buyerName}${slot.regNumber ? ` (${slot.regNumber})` : ''} via LastCall` : slot.status === 'booked' ? slot.customerName : `Var ${slot.customerName}`} · {kr(slot.fullPrice)}
          {slot.guests && slot.guests > 1 ? ` (${kr(slot.fullPrice / slot.guests)} per pers.)` : ''}
          {slot.status === 'sold' && ` · gebyr ${kr(slot.fee ?? 0)}${slot.introSpotsUsed ? ' (introtilbud)' : ''}`}
        </p>
        {!!slot.cancellerBonusPct && slot.status !== 'booked' && (
          <p className="text-sm text-[#13772a]">
            🎁 {slot.status === 'sold' ? `${slot.customerName} fikk ${kr(cancellerBonus(slot))} (${slot.cancellerBonusPct} %) for å avbestille i tide` : `${slot.customerName} får ${slot.cancellerBonusPct} % av salgsprisen hvis timen selges`}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`eyebrow rounded px-2 py-1 ${st.pill}`}>
          {st.label}
          {slot.status === 'held' && heldUntil && ` · frigis ${clock(heldUntil)} (${countdown(heldUntil - now)})`}
          {(slot.status === 'released' || slot.status === 'sold') && ` · ${kr(lastCallPrice(slot))}`}
        </span>
        {slot.status === 'booked' && (
          <Button size="sm" variant="utility" onClick={onCancel}>
            Simuler avbestilling
          </Button>
        )}
        {slot.status === 'cancelled' && (
          <Button size="sm" onClick={onRelease}>
            Frigi
          </Button>
        )}
        {slot.status === 'held' && (
          <Button size="sm" variant="utility" onClick={onRelease}>
            Frigi nå
          </Button>
        )}
        {slot.status === 'released' && (
          <Button size="sm" variant="ghost" onClick={onWithdraw}>
            Trekk tilbake
          </Button>
        )}
      </div>
    </div>
  )
}

function FeePreview({ slot, biz }: { slot: Slot; biz: Business }) {
  const f = calculateFee(slot, biz)
  const bonus = cancellerBonus(slot)
  const spots = `${f.spots} fylt${f.spots === 1 ? '' : 'e'} plass${f.spots === 1 ? '' : 'er'}`
  return (
    <div className="rounded-xl border border-hairline p-4 text-sm text-ink-2">
      <div className="flex justify-between">
        <span>LastCall-gebyr hvis den selges ({spots})</span>
        <b className="font-semibold">{f.fee === 0 && f.standardFee > 0 ? <><s className="font-normal text-faint">{kr(f.standardFee)}</s> {kr(0)}</> : kr(f.fee)}</b>
      </div>
      {bonus > 0 && (
        <div className="mt-1 flex justify-between">
          <span>Avbestillingsbonus til {slot.customerName} ({slot.cancellerBonusPct} %)</span>
          <b className="font-semibold">{kr(bonus)}</b>
        </div>
      )}
      <div className="mt-1 flex justify-between">
        <span>Du beholder</span>
        <b className="font-semibold text-green">{kr(f.price - f.fee - bonus)}</b>
      </div>
      <p className="mt-2 text-muted">
        {f.introSpotsUsed > 0 ? `Introtilbud: gratis. Bruker ${f.introSpotsUsed} av dine ${biz.introSpotsLeft} gjenværende gratis plasser.` : `${FEE_PER_SPOT} kr per fylte plass, aldri mer enn ${FEE_CAP_PCT} %.`} Kun betaling hvis kunden møter opp.
      </p>
    </div>
  )
}

function ReleaseDialog({ slot, biz, rule, onClose, onRelease }: { slot: Slot; biz: Business; rule: AutoReleaseRule; onClose: () => void; onRelease: (discountPct: number) => void }) {
  const [mode, setMode] = useState<ReleaseMode>(rule.mode)
  const [pct, setPct] = useState(rule.discountPct || 20)
  const discount = mode === 'full' ? 0 : pct
  const price = lastCallPrice({ ...slot, discountPct: discount })
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="heading-2">Frigi som Last Call</h2>
          <p className="mt-1 text-[15px] text-muted">
            {slot.title} · {clock(slot.start)} · var bestilt av {slot.customerName}
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-paper p-4">
          <Segmented
            value={mode}
            onChange={(m) => m && setMode(m)}
            options={[
              { value: 'full', label: 'Full pris' },
              { value: 'discount', label: 'Rabatt' },
            ]}
          />
          {mode === 'full' ? (
            <p className="text-sm text-muted">Kundene ser den som «Hopp over køen». Ingen rabatt nødvendig: du bestemmer prisen.</p>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Rabatt</span>
                <span className="title">{pct} %</span>
              </div>
              <input className="mt-2 w-full" type="range" min={5} max={70} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <span className="rounded bg-purple/40 px-1.5 text-xs text-purple-deep">✦ AI</span>
                Foreslått {rule.discountPct} % basert på Auto-frigivelsesregelen din og etterspørsel i nærheten
              </p>
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-muted">{discount > 0 ? <><s>{kr(slot.fullPrice)}</s> → kundene betaler</> : 'Kundene betaler'}</span>
          <span className="heading-1">{kr(price)}</span>
        </div>
        <p className="text-[15px] text-ink-2">
          Du berger <b className="font-semibold">{kr(price)}</b> i stedet for <b className="font-semibold">{kr(0)}</b>.
        </p>
        <FeePreview slot={{ ...slot, discountPct: discount }} biz={biz} />
        <div className="flex gap-2">
          <Button variant="utility" className="flex-1" onClick={onClose}>
            Avbryt
          </Button>
          <Button className="flex-1" onClick={() => onRelease(discount)}>
            Frigi
          </Button>
        </div>
      </div>
    </Modal>
  )
}
