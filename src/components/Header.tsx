import { useAppState } from '../domain/store'

export function Header({ side, route }: { side: 'customer' | 'business'; route: string }) {
  const state = useAppState()
  const unseen = state.alerts.filter((a) => !a.seen).length

  const link = (active: boolean) => `rounded-md px-2.5 py-1.5 text-[15px] transition ${active ? 'bg-black/5 font-medium text-ink' : 'text-ink-2 hover:bg-black/5'}`

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 sm:px-6">
        <a href={side === 'business' ? '#/biz' : '#/'} className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-canvas text-lg shadow-soft">🔔</span>
          <span className="text-lg font-bold tracking-[-0.4px]">LastCall</span>
        </a>

        <nav className="ml-2 hidden items-center gap-1 sm:flex">
          {side === 'customer' ? (
            <>
              <a href="#/" className={link(route === '/')}>
                Marketplace
              </a>
              <a href="#/wants" className={link(route.startsWith('/wants'))}>
                Wants
              </a>
            </>
          ) : (
            <>
              <a href="#/biz" className={link(route === '/biz' || (route.startsWith('/biz/') && route !== '/biz/register'))}>
                Dashboard
              </a>
              <a href="#/biz/register" className={link(route === '/biz/register')}>
                Add business
              </a>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {side === 'customer' && (
            <a href="#/wants" className="relative grid h-9 w-9 place-items-center rounded-lg text-lg hover:bg-black/5 sm:hidden" aria-label="Wants">
              🔔
            </a>
          )}
          {side === 'customer' && unseen > 0 && (
            <a href="#/wants" className="eyebrow hidden animate-fade rounded-full bg-primary/10 px-2.5 py-1 text-primary sm:inline-block">
              {unseen} new alert{unseen === 1 ? '' : 's'}
            </a>
          )}
          <div className="inline-flex rounded-lg border border-hairline bg-paper p-0.5">
            <a href="#/" className={`rounded-md px-3 py-1 text-[15px] font-medium transition ${side === 'customer' ? 'bg-canvas text-ink shadow-soft' : 'text-muted hover:text-ink'}`}>
              Customer
            </a>
            <a href="#/biz" className={`rounded-md px-3 py-1 text-[15px] font-medium transition ${side === 'business' ? 'bg-canvas text-ink shadow-soft' : 'text-muted hover:text-ink'}`}>
              Business
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
