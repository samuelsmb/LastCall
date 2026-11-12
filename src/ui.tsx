import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CATEGORY_META } from './domain/categories'
import { lastCallPrice } from './domain/selectors'
import type { Category, Slot } from './domain/types'
import { countdown, kr, useNow } from './lib'

type Variant = 'primary' | 'secondary' | 'utility' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'rounded-full bg-primary text-white hover:bg-primary-active',
  secondary: 'rounded-full bg-canvas text-ink shadow-soft hover:bg-paper',
  utility: 'rounded-lg border border-hairline bg-canvas text-ink hover:bg-paper',
  ghost: 'rounded-lg text-ink-2 hover:bg-black/5',
  danger: 'rounded-lg border border-hairline bg-canvas text-ink-2 hover:bg-paper',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'px-3.5 py-1 text-[15px]', md: 'px-5 py-2.5 text-base', lg: 'px-6 py-3 text-base' }
  return (
    <button
      {...rest}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
    />
  )
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-xl border border-hairline bg-canvas ${className}`}>{children}</div>
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[15px] font-medium transition ${active ? 'border-ink bg-ink text-white' : 'border-hairline bg-canvas text-ink-2 hover:bg-paper'}`}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T | null; options: { value: T; label: ReactNode }[]; onChange: (v: T | null) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-hairline bg-canvas p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(value === o.value ? null : o.value)}
          className={`cursor-pointer rounded-md px-3 py-1 text-[15px] font-medium transition ${value === o.value ? 'bg-paper text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  const m = CATEGORY_META[category]
  return (
    <span className={`eyebrow inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${m.tint} ${m.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

export function Countdown({ start, className = '' }: { start: number; className?: string }) {
  const now = useNow()
  const ms = start - now
  const urgent = ms < 3_600_000
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium tabular-nums ${urgent ? 'text-orange' : 'text-muted'} ${className}`}>
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
      </svg>
      {ms > 0 ? `Starter om ${countdown(ms)}` : 'Startet'}
    </span>
  )
}

/** `from`: the final price can vary (e.g. workshops), so show "Fra X kr". */
export function Price({ slot, big = false, from = false }: { slot: Slot; big?: boolean; from?: boolean }) {
  const price = lastCallPrice(slot)
  const discounted = (slot.discountPct ?? 0) > 0
  const guests = slot.guests ?? 0
  return (
    <span className="inline-flex flex-col">
      <span className="inline-flex items-baseline gap-2">
        <span className={big ? 'heading-1' : 'title'}>
          {from && 'Fra '}
          {kr(guests > 1 ? price / guests : price)}
        </span>
        {guests > 1 && <span className={`text-muted ${big ? 'text-base' : 'text-sm'}`}>per person</span>}
        {discounted && <s className={`text-faint ${big ? 'text-base' : 'text-sm'}`}>{kr(guests > 1 ? slot.fullPrice / guests : slot.fullPrice)}</s>}
      </span>
      {guests > 1 && (
        <span className="text-sm text-muted">
          {kr(price)} totalt for {guests} gjester
        </span>
      )}
    </span>
  )
}

export function DiscountSticker({ slot, className = '' }: { slot: Slot; className?: string }) {
  const d = slot.discountPct ?? 0
  return <span className={`eyebrow rounded-full bg-canvas px-2.5 py-1 text-ink shadow-soft ${className}`}>{d > 0 ? `−${d}%` : slot.perk ?? 'Hopp over køen'}</span>
}

/** Colour-blocked illustration band with a page-icon tile, the Notion way. */
export function Band({ category, image, className = '', iconSize = 'h-14 w-14 text-3xl', children }: { category: Category; image?: string; className?: string; iconSize?: string; children?: ReactNode }) {
  const m = CATEGORY_META[category]
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 overflow-hidden ${m.band}`}>
        {image ? (
          <SiteImage src={image} />
        ) : (
          <>
            <span className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15" />
            <span className="absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-black/5" />
          </>
        )}
      </div>
      <span className={`absolute bottom-0 left-5 z-10 grid translate-y-1/2 place-items-center rounded-xl border border-hairline bg-canvas shadow-soft transition duration-300 group-hover:-rotate-6 ${iconSize}`}>
        {m.icon}
      </span>
      {children}
    </div>
  )
}

/** Below this natural width a site's picture is treated as a logo or icon rather than a photo. */
const LOGO_MAX_WIDTH = 400

/** A website's picture: photos fill the frame, logos and icons (small or vector) are scaled down to sit in the middle. */
export function SiteImage({ src }: { src: string }) {
  const [smallSrc, setSmallSrc] = useState<string | null>(null)
  const logo = smallSrc === src || /\.svg(\?|#|$)/i.test(src)
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onLoad={(e) => e.currentTarget.naturalWidth < LOGO_MAX_WIDTH && setSmallSrc(src)}
      className={`h-full w-full ${logo ? 'object-contain p-4' : 'object-cover'}`}
    />
  )
}

export function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <Overlay>
      <div className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-black/30 p-3 sm:items-center" onClick={onClose}>
        <div className="max-h-[calc(100vh-1.5rem)] w-full max-w-md animate-rise overflow-y-auto rounded-2xl bg-canvas p-6 shadow-lifted" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </Overlay>
  )
}

/** Renders on document.body so `fixed` is relative to the viewport, not an animated (transformed) ancestor. */
export function Overlay({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}

export function BellIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="32" cy="7" r="3.5" />
      <path d="M32 11c-11 0-18 8-18 20v13l-7 10h50l-7-10V31c0-12-7-20-18-20z" />
      <path d="M25 58a7 7 0 0 0 14 0" />
    </svg>
  )
}

/** The bell hangs from its top and swings like a damped pendulum when struck. */
export function Mascot({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const sim = useRef({ angle: 0, vel: 0, raf: 0 })

  // Positive angle swings the bell's body left.
  const step = () => {
    const s = sim.current
    s.vel += -0.025 * s.angle - 0.035 * s.vel
    s.angle = Math.max(-70, Math.min(70, s.angle + s.vel))
    if (ref.current) ref.current.style.transform = `rotate(${s.angle}deg)`
    if (Math.abs(s.angle) < 0.05 && Math.abs(s.vel) < 0.05) {
      s.angle = s.vel = s.raf = 0
      if (ref.current) ref.current.style.transform = ''
      return
    }
    s.raf = requestAnimationFrame(step)
  }

  const hit = (push: number) => {
    const s = sim.current
    s.vel += Math.max(-14, Math.min(14, push))
    if (!s.raf) s.raf = requestAnimationFrame(step)
  }

  useEffect(() => () => cancelAnimationFrame(sim.current.raf), [])

  const sideOf = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return e.clientX > r.left + r.width / 2 ? 1 : -1
  }

  return (
    <span
      ref={ref}
      onPointerEnter={(e) => hit(Math.abs(e.movementX) > 1 ? -e.movementX * 0.8 : sideOf(e) * 5)}
      onPointerMove={(e) => hit(-e.movementX * 0.25)}
      onPointerDown={(e) => hit(sideOf(e) * 12)}
      className={`inline-block origin-top cursor-pointer select-none text-6xl leading-none ${className}`}
    >
      🔔
    </span>
  )
}
