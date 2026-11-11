import { useAppState } from '../domain/store'
import { go } from '../lib'

export function Header({ side, route }: { side: 'customer' | 'business'; route: string }) {
  const state = useAppState()
  const unseen = state.alerts.filter((a) => !a.seen).length
  const biz = state.businesses.find((b) => b.id === state.currentBusinessId)

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <a href={side === 'business' ? '#/biz' : '#/'} className="group flex items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-ink bg-sunny text-2xl shadow-chunky-sm transition group-hover:rotate-6">
            <span className="animate-ring origin-top">🔔</span>
          </span>
          <span className="leading-none">
            <span className="block font-display text-2xl font-bold tracking-tight">
              Last<span className="text-tomato">Call</span>
            </span>
            <span className="hidden font-display text-xs text-ink/60 sm:block">
              {side === 'business' ? `for ${biz?.name ?? 'business'}` : 'Cooler Copenhagen'}
            </span>
          </span>
        </a>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {side === 'customer' && (
            <>
              <a href="#/" className={`hidden rounded-full px-3 py-1.5 font-display font-medium sm:block ${route === '/' ? 'bg-ink/10' : 'hover:bg-ink/5'}`}>
                Marketplace
              </a>
              <a href="#/wants" className={`relative rounded-full px-3 py-1.5 font-display font-medium ${route === '/wants' ? 'bg-ink/10' : 'hover:bg-ink/5'}`}>
                <span className="sm:hidden">🔔</span>
                <span className="hidden sm:inline">My Wants</span>
                {unseen > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-pop place-items-center rounded-full border-2 border-ink bg-tomato px-1 text-xs font-bold text-white">
                    {unseen}
                  </span>
                )}
              </a>
            </>
          )}

          <div className="ml-1 flex rounded-full border-[3px] border-ink bg-white p-1 shadow-chunky-sm">
            <button
              onClick={() => go('/')}
              className={`cursor-pointer rounded-full px-3 py-1 font-display text-sm font-semibold transition ${side === 'customer' ? 'bg-tomato text-white' : 'hover:bg-ink/5'}`}
            >
              🕵️<span className="hidden sm:inline"> Customer</span>
            </button>
            <button
              onClick={() => go('/biz')}
              className={`cursor-pointer rounded-full px-3 py-1 font-display text-sm font-semibold transition ${side === 'business' ? 'bg-grape text-white' : 'hover:bg-ink/5'}`}
            >
              🏪<span className="hidden sm:inline"> Business</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
