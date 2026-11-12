import { useEffect, useState } from 'react'
import { CITY } from '../brand'
import { resetDemo } from '../domain/store'

export function HomepageFooter() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setDone(false), 1800)
    return () => clearTimeout(t)
  }, [done])

  return (
    <footer className="bg-paper px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 text-center">
        {/* Show only the icon portion of the shared header logo. */}
        <button type="button" onClick={() => { resetDemo(); setDone(true) }} title="Nullstill demoen" aria-label="Nullstill demoen" className="block h-16 w-14 cursor-pointer overflow-hidden rounded-md transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <img
            src={`${import.meta.env.BASE_URL}img/lastcall-logo.svg`}
            alt=""
            width={518}
            height={232}
            className="h-16 w-auto max-w-none"
          />
        </button>
        <span role="status" className={`-mt-3 h-4 text-xs text-muted transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}>
          {done ? 'Nullstilt ✓' : ''}
        </span>
        <p className="max-w-sm text-sm font-semibold leading-relaxed text-ink sm:max-w-none">
          LastCall · Laget i {CITY}, snart i resten av Norge
        </p>
      </div>
    </footer>
  )
}
