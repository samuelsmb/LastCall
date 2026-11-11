import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { CATEGORY_META } from './domain/categories'
import { lastCallPrice } from './domain/selectors'
import type { Category, Slot } from './domain/types'
import { countdown, kr, useNow } from './lib'

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'light'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-oxblood',
  secondary: 'border border-ink text-ink hover:bg-ink hover:text-paper',
  gold: 'bg-gold text-ink hover:bg-gold-light',
  light: 'border border-paper/60 text-paper hover:bg-paper hover:text-ink',
  ghost: 'text-ink underline-offset-[6px] hover:underline px-0!',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'px-4 py-2 text-[0.62rem]', md: 'px-7 py-3.5 text-[0.68rem]', lg: 'px-9 py-4 text-[0.72rem]' }
  return (
    <button
      {...rest}
      className={`inline-flex cursor-pointer items-center justify-center gap-3 font-medium uppercase tracking-[0.24em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
    />
  )
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`border border-ink/12 bg-ivory ${className}`}>{children}</div>
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`eyebrow shrink-0 cursor-pointer whitespace-nowrap border px-4 py-2.5 transition duration-300 ${active ? 'border-ink bg-ink text-paper' : 'border-ink/15 text-ink/70 hover:border-ink hover:text-ink'}`}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T | null; options: { value: T; label: ReactNode }[]; onChange: (v: T | null) => void }) {
  return (
    <div className="flex gap-6">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(value === o.value ? null : o.value)}
          className={`cursor-pointer border-b pb-1 font-display text-lg italic transition ${value === o.value ? 'border-gold text-ink' : 'border-transparent text-ink/50 hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function CategoryBadge({ category, className = '' }: { category: Category; className?: string }) {
  return <span className={`eyebrow text-gold ${className}`}>{CATEGORY_META[category].label}</span>
}

export function Countdown({ start, className = '' }: { start: number; className?: string }) {
  const now = useNow()
  const ms = start - now
  const urgent = ms < 3_600_000
  return (
    <span className={`eyebrow inline-flex items-center gap-2 tabular-nums ${urgent ? 'text-oxblood' : 'text-stone'} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${urgent ? 'bg-oxblood' : 'bg-stone/60'}`} />
      {ms > 0 ? `Commences in ${countdown(ms)}` : 'Commenced'}
    </span>
  )
}

export function Price({ slot, big = false, light = false }: { slot: Slot; big?: boolean; light?: boolean }) {
  const price = lastCallPrice(slot)
  const discounted = (slot.discountPct ?? 0) > 0
  return (
    <span className="inline-flex items-baseline gap-3">
      <span className={`font-display ${big ? 'text-5xl' : 'text-2xl'}`}>{kr(price)}</span>
      {discounted && <s className={`${light ? 'text-paper/50' : 'text-stone'} ${big ? 'text-base' : 'text-xs'}`}>{kr(slot.fullPrice)}</s>}
    </span>
  )
}

export function DiscountSticker({ slot, className = '' }: { slot: Slot; className?: string }) {
  const d = slot.discountPct ?? 0
  return (
    <span className={`border border-gold/70 bg-ink/40 px-3 py-1 text-gold-light backdrop-blur-sm ${d > 0 ? 'font-display text-lg italic' : 'eyebrow'} ${className}`}>
      {d > 0 ? `−${d}%` : slot.perk ?? 'Released'}
    </span>
  )
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w && !/^(the|&|and|of|at)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/** A dark, category-tinted panel with a gold monogram, standing in for photography. */
export function Panel({ category, name, className = '', monogram = 'text-7xl', children }: { category: Category; name: string; className?: string; monogram?: string; children?: ReactNode }) {
  return (
    <div className={`relative overflow-hidden bg-linear-to-br ${CATEGORY_META[category].panel} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgb(255_255_255/0.12),transparent_55%)]" />
      <div className="absolute inset-3 border border-gold/35" />
      <div className="absolute inset-0 grid place-items-center">
        <span className={`font-display italic text-gold-light/85 transition duration-[1200ms] group-hover:scale-110 ${monogram}`}>{initials(name)}</span>
      </div>
      {children}
    </div>
  )
}

export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`}>
      <span className="h-px w-12 bg-gold/60" />
      <span className="text-xs">◆</span>
      <span className="h-px w-12 bg-gold/60" />
    </div>
  )
}

export function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-ink/60 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md animate-rise border border-gold/40 bg-paper p-8" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function BellIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 72" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="32" cy="6" r="3.2" />
      <path d="M32 9.5c-11.2 0-18.5 8.2-18.5 20.2v13.6L7 52.5h50l-6.5-9.2V29.7C50.5 17.7 43.2 9.5 32 9.5z" />
      <path d="M13.8 44.5h36.4" opacity="0.5" />
      <path d="M25.5 56.5a6.5 6.5 0 0 0 13 0" />
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
      className={`inline-block origin-top cursor-pointer select-none text-gold ${className}`}
    >
      <BellIcon className="h-full w-full" />
    </span>
  )
}
