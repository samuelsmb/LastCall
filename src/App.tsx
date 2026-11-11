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
    <div className="flex min-h-screen flex-col">
      <Header side={side} route={route} />
      <main key={route} className="mx-auto w-full max-w-[1200px] flex-1 animate-rise px-4 pb-24 pt-8 sm:px-6">
        {page}
      </main>
      {side === 'customer' && <AlertToasts />}
      <footer className="border-t border-hairline bg-paper px-6 py-8 text-center text-sm text-ink-2">
        <span className="font-semibold">LastCall</span> · the cancellation economy · Cooler Copenhagen
      </footer>
    </div>
  )
}
