import { useAppState } from '../domain/store'

export function Header({ side, route }: { side: 'customer' | 'business'; route: string }) {
  const state = useAppState()
  const unseen = state.alerts.filter((a) => !a.seen).length

  const link = (active: boolean) => `rounded-md px-2.5 py-1.5 text-[15px] transition ${active ? 'bg-black/5 font-medium text-ink' : 'text-ink-2 hover:bg-black/5'}`

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-baseline gap-4 px-4 py-3 sm:px-6">
        <a href="#/" onClick={() => window.scrollTo({ top: 0 })} className="shrink-0 rounded-md leading-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          {/* The wordmark baseline is y=198 in the SVG's y=27–259 viewBox. */}
          <img src={`${import.meta.env.BASE_URL}img/lastcall-logo.svg`} alt="LastCall" width={518} height={232} className="inline-block h-14 w-auto align-[-14.724px] sm:h-16 sm:align-[-16.828px]" />
        </a>

        <div className="ml-auto flex items-baseline gap-2 sm:gap-4">
          <nav className="hidden items-baseline gap-1 sm:flex" aria-label="Hovedmeny">
            {side === 'customer' ? (
              <>
                <a href="#/" className={link(route === '/' || route.startsWith('/lc') || route.startsWith('/booked'))}>
                  Markedsplass
                </a>
                <a href="#/wants" className={link(route.startsWith('/wants'))}>
                  Ønsker
                  {unseen > 0 && <span className="ml-1.5 inline-block min-w-5 animate-twinkle rounded-full bg-pink px-1.5 text-center text-xs font-bold leading-5 text-white">{unseen}</span>}
                </a>
              </>
            ) : (
              <>
                <a href="#/biz" className={link(route.startsWith('/biz'))}>
                  Oversikt
                </a>
              </>
            )}
          </nav>

          {side === 'customer' && (
            <a href="#/wants" className="relative grid h-9 w-9 place-items-center rounded-lg text-lg hover:bg-black/5 sm:hidden" aria-label="Ønsker">
              🔔
              {unseen > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 animate-twinkle rounded-full bg-pink px-1 text-center text-[11px] font-bold leading-4 text-white">{unseen}</span>}
            </a>
          )}
          {side === 'customer' && unseen > 0 && (
            <a href="#/wants" className="eyebrow hidden animate-fade rounded-full bg-primary/10 px-2.5 py-1 text-primary sm:inline-block">
              {unseen} {unseen === 1 ? 'nytt varsel' : 'nye varsler'}
            </a>
          )}
          <div className="inline-flex items-baseline rounded-lg border border-hairline bg-paper p-0.5">
            <a href="#/" className={`rounded-md px-3 py-1 text-[15px] font-medium transition ${side === 'customer' ? 'bg-canvas text-ink shadow-soft' : 'text-muted hover:text-ink'}`}>
              Kunde
            </a>
            <a href="#/biz" className={`rounded-md px-3 py-1 text-[15px] font-medium transition ${side === 'business' ? 'bg-canvas text-ink shadow-soft' : 'text-muted hover:text-ink'}`}>
              Bedrift
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
