import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { CATEGORY_META } from './domain/categories'
import { lastCallPrice } from './domain/selectors'
import type { Category, Slot } from './domain/types'
import { countdown, kr, useNow } from './lib'

type Variant = 'primary' | 'secondary' | 'sunny' | 'mint' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-tomato text-white',
  secondary: 'bg-white text-ink',
  sunny: 'bg-sunny text-ink',
  mint: 'bg-mint text-ink',
  ghost: 'bg-transparent text-ink shadow-none! border-transparent! hover:bg-ink/5',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'px-3 py-1.5 text-sm border-2', md: 'px-5 py-2.5 border-[3px]', lg: 'px-7 py-3.5 text-lg border-[3px]' }
  return (
    <button
      {...rest}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-ink font-display font-semibold shadow-chunky-sm transition hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
    />
  )
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-3xl border-[3px] border-ink bg-white shadow-chunky ${className}`}>{children}</div>
}

export function Chip({ active, onClick, children, className = '' }: { active: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border-2 border-ink px-3.5 py-1.5 font-display text-sm font-medium transition hover:-translate-y-0.5 ${active ? 'bg-ink text-white shadow-chunky-sm' : 'bg-white'} ${className}`}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T | null; options: { value: T; label: ReactNode }[]; onChange: (v: T | null) => void }) {
  return (
    <div className="inline-flex rounded-full border-2 border-ink bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(value === o.value ? null : o.value)}
          className={`cursor-pointer rounded-full px-3 py-1 font-display text-sm font-medium transition ${value === o.value ? 'bg-sunny shadow-[inset_0_0_0_2px_#1e1b2e]' : 'hover:bg-ink/5'}`}
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
    <span className={`inline-flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 font-display text-xs font-medium ${m.soft}`}>
      {m.emoji} {m.label}
    </span>
  )
}

export function Countdown({ start, className = '' }: { start: number; className?: string }) {
  const now = useNow()
  const ms = start - now
  const urgent = ms < 3_600_000
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-sm font-semibold tabular-nums ${urgent ? 'bg-tomato text-white' : 'bg-ink/8'} ${className}`}>
      ⏳ {ms > 0 ? `starts in ${countdown(ms)}` : 'started'}
    </span>
  )
}

export function Price({ slot, big = false }: { slot: Slot; big?: boolean }) {
  const price = lastCallPrice(slot)
  const discounted = (slot.discountPct ?? 0) > 0
  return (
    <span className="inline-flex items-baseline gap-2">
      {discounted && <s className={`text-ink/50 ${big ? 'text-lg' : 'text-sm'}`}>{kr(slot.fullPrice)}</s>}
      <span className={`font-display font-bold ${big ? 'text-4xl' : 'text-xl'}`}>{kr(price)}</span>
    </span>
  )
}

export function DiscountSticker({ slot, className = '' }: { slot: Slot; className?: string }) {
  const d = slot.discountPct ?? 0
  return (
    <span className={`inline-flex rotate-6 items-center rounded-2xl border-[3px] border-ink bg-sunny px-2.5 py-1 font-display font-bold shadow-chunky-sm ${className}`}>
      {d > 0 ? `-${d}%` : slot.perk ?? 'Last Call!'}
    </span>
  )
}

const CONFETTI_COLORS = ['#ff5a36', '#ffd23f', '#3ddc97', '#7b5cff', '#ff8fc7', '#4cc9f0']

export function Confetti({ count = 80 }: { count?: number }) {
  const [visible, setVisible] = useState(true)
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        dur: 1.8 + Math.random() * 1.6,
        delay: Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 200,
        spin: (Math.random() - 0.5) * 1440,
        round: Math.random() > 0.6,
      })),
    [count],
  )
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(t)
  }, [])
  if (!visible) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              borderRadius: p.round ? '999px' : undefined,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <Card className="p-6">{children}</Card>
      </div>
    </div>
  )
}

export function Mascot({ size = 'text-6xl', className = '' }: { size?: string; className?: string }) {
  return <span className={`inline-block animate-ring origin-top ${size} ${className}`}>🔔</span>
}
