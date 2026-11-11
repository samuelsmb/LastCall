import { useEffect } from 'react'
import { AlertToasts } from './components/AlertToasts'
import { Header } from './components/Header'
import { applyAutoRelease } from './domain/store'
import { useRoute } from './lib'
import { Booked } from './screens/Booked'
import { BusinessHome } from './screens/BusinessHome'
import { LastCallDetail } from './screens/LastCallDetail'
import { Marketplace } from './screens/Marketplace'
import { Register } from './screens/Register'
import { Wants } from './screens/Wants'

export default function App() {
  const route = useRoute()

  useEffect(() => {
    applyAutoRelease(Date.now())
    const t = setInterval(() => applyAutoRelease(Date.now()), 3000)
    return () => clearInterval(t)
  }, [])

  const side = route.startsWith('/biz') ? 'business' : 'customer'
  const [, first, second] = route.split('/')

  let page
  if (first === 'lc' && second) page = <LastCallDetail id={second} />
  else if (first === 'booked' && second) page = <Booked id={second} />
  else if (first === 'wants') page = <Wants />
  else if (first === 'biz' && second === 'register') page = <Register />
  else if (first === 'biz') page = <BusinessHome />
  else page = <Marketplace />

  return (
    <div className="min-h-screen">
      <Header side={side} route={route} />
      <main key={route} className="mx-auto max-w-7xl animate-rise px-5 pb-28 pt-10 sm:px-8">
        {page}
      </main>
      {side === 'customer' && <AlertToasts />}
      <footer className="border-t border-ink/10 py-10 text-center">
        <p className="font-display text-2xl tracking-[0.3em]">LASTCALL</p>
        <p className="eyebrow mt-2 text-stone">Cooler Copenhagen · Est. 2026 · Membership by discernment</p>
      </footer>
    </div>
  )
}
