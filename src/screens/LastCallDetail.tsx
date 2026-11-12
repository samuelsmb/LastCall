import { ArrowLeft, Check, Star } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { businessOf, savings } from '../domain/selectors'
import { bookSlot, toggleFollow, useAppState } from '../domain/store'
import { clock, go, kr, useNow, when } from '../lib'
import { Band, Button, CategoryBadge, Countdown, DiscountSticker, PinIcon, Price } from '../ui'

export function LastCallDetail({ id }: { id: string }) {
  const state = useAppState()
  const now = useNow()
  const [name, setName] = useState('')
  const [reg, setReg] = useState('')
  const [tooSlow, setTooSlow] = useState(false)
  const slot = state.slots.find((s) => s.id === id)

  if (!slot) return <Gone title="Denne Last Call finnes ikke lenger" />
  const biz = businessOf(state, slot)
  const available = slot.status === 'released' && slot.start > now
  const following = state.wants.some((w) => w.businessId === biz.id)

  const isCar = biz.category === 'car'
  const regOk = /^[A-ZÆØÅ]{2}\s?\d{4,5}$/.test(reg.trim().toUpperCase())

  const book = () => {
    if (isCar && !regOk) return
    if (bookSlot(slot.id, name.trim() || 'Gjest', isCar ? reg.trim().toUpperCase() : undefined)) go(`/booked/${slot.id}`)
    else setTooSlow(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <a href="#/" className="self-start rounded-md px-2 py-1 text-[15px] text-muted hover:bg-black/5 hover:text-ink">
        <ArrowLeft className="mr-1 inline h-4 w-4 align-[-3px]" aria-hidden />Tilbake til markedsplassen
      </a>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-hairline bg-canvas">
          <Band category={biz.category} image={biz.image} className="h-48" iconSize="h-20 w-20">
            <DiscountSticker slot={slot} className="absolute right-5 top-5" />
          </Band>
          <div className="flex flex-col gap-3 px-6 pb-8 pt-14 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CategoryBadge category={biz.category} />
              <Button size="sm" variant={following ? 'utility' : 'secondary'} onClick={() => toggleFollow(biz.id)} aria-pressed={following}>
                {following ? <Check className="mr-1 inline h-4 w-4 align-[-3px]" aria-hidden /> : <Star className="mr-1 inline h-4 w-4 align-[-3px]" aria-hidden />}
                {following ? `Følger ${biz.name}` : `Følg ${biz.name}`}
              </Button>
            </div>
            {following && <p className="-mt-1 text-sm text-muted">Vi varsler deg når {biz.name} frigir en ny Last Call, når som helst.</p>}
            <h1 className="heading-1">{slot.title}</h1>
            <p className="title text-ink-2">
              {biz.name} <span className="font-normal text-muted">· {biz.tagline}</span>
            </p>
            <p className="max-w-2xl text-ink-2">{slot.description}</p>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2">
              <Info label="Når" value={`${when(slot.start, now)} – ${clock(slot.start + slot.durationMin * 60_000)}`} />
              <Info label="Varighet" value={`${slot.durationMin} min${slot.guests ? ` · bord for ${slot.guests}` : ''}`} />
              <Info
                label="Adresse"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <PinIcon className="h-4 w-4 text-primary" />
                    {biz.address}, {biz.neighbourhood}
                  </span>
                }
              />
              <Info label="Avstand" value={`${biz.distanceKm.toLocaleString('nb-NO')} km unna`} />
              {biz.website && (
                <Info
                  label="Nettside"
                  value={
                    <a href={`https://${biz.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {biz.website}
                    </a>
                  }
                />
              )}
            </dl>
          </div>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-5 rounded-2xl border border-hairline bg-canvas p-6 shadow-soft">
            <Countdown start={slot.start} />
            <div>
              <Price slot={slot} big from={biz.category === 'car'} />
              {savings(slot) > 0 ? <p className="mt-1 font-medium text-green">Du sparer {kr(savings(slot))}</p> : <p className="mt-1 font-medium text-green">{slot.perk ?? 'Hopp over køen. Vanligvis fullbooket.'}</p>}
            </div>

            {available && !tooSlow ? (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="eyebrow text-muted">Navnet ditt</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kari Nordmann"
                    className="rounded border border-[#ddd] bg-canvas px-2.5 py-2 text-[15px] outline-none placeholder:text-faint focus:shadow-soft focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                {isCar && (
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow text-muted">Registreringsnummer</span>
                    <input
                      value={reg}
                      onChange={(e) => setReg(e.target.value.toUpperCase())}
                      placeholder="AB 12345"
                      maxLength={8}
                      className="rounded border border-[#ddd] bg-canvas px-2.5 py-2 text-[15px] font-semibold uppercase tracking-wider outline-none placeholder:font-normal placeholder:text-faint focus:shadow-soft focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                )}
                <Button size="lg" onClick={book} disabled={isCar && !regOk}>
                  Bestill nå
                </Button>
                <p className="text-center text-sm text-faint">Ingen betaling nødvendig i denne demoen.</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-paper p-5 text-center">
                <span className="text-3xl">🐢</span>
                <p className="title">For sent!</p>
                <p className="text-sm text-muted">Borte! Vi varsler deg når den neste kommer.</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="utility" onClick={() => go('/')}>
                    Se flere
                  </Button>
                  <Button size="sm" onClick={() => go('/wants')}>
                    Opprett et ønske
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-canvas p-4">
      <dt className="eyebrow text-faint">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}

export function Gone({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="text-5xl">🫥</span>
      <h1 className="heading-1">{title}</h1>
      <Button onClick={() => go('/')}>Tilbake til markedsplassen</Button>
    </div>
  )
}
