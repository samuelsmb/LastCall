import { useAppState } from '../domain/store'
import { BellIcon } from '../ui'

export function Header({ side, route }: { side: 'customer' | 'business'; route: string }) {
  const state = useAppState()
  const unseen = state.alerts.filter((a) => !a.seen).length
  const biz = state.businesses.find((b) => b.id === state.currentBusinessId)

  const link = (active: boolean) => `eyebrow border-b pb-1 transition ${active ? 'border-gold text-ink' : 'border-transparent text-ink/55 hover:text-ink'}`

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4 sm:px-8">
        <a href={side === 'business' ? '#/biz' : '#/'} className="flex items-center gap-3">
          <BellIcon className="h-8 w-7 text-gold" />
          <span className="leading-none">
            <span className="block font-display text-2xl tracking-[0.28em]">LASTCALL</span>
            <span className="eyebrow hidden text-[0.55rem] text-stone sm:block">{side === 'business' ? `Establishment · ${biz?.name ?? ''}` : 'Cooler Copenhagen'}</span>
          </span>
        </a>

        <nav className="ml-auto flex items-center gap-5 sm:gap-8">
          {side === 'customer' && (
            <>
              <a href="#/" className={`hidden sm:block ${link(route === '/')}`}>
                The Collection
              </a>
              <a href="#/wants" className={`relative ${link(route === '/wants')}`}>
                Wants
                {unseen > 0 && <span className="absolute -right-4 -top-1.5 grid h-4 min-w-4 animate-fade place-items-center rounded-full bg-oxblood px-1 text-[0.55rem] font-semibold tracking-normal text-paper">{unseen}</span>}
              </a>
            </>
          )}

          <div className="flex border border-ink/20">
            <a href="#/" className={`eyebrow px-3 py-2 transition sm:px-4 ${side === 'customer' ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'}`}>
              Guest
            </a>
            <a href="#/biz" className={`eyebrow px-3 py-2 transition sm:px-4 ${side === 'business' ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'}`}>
              Establishment
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
