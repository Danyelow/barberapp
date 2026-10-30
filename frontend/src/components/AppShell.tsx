import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, CalendarClock, ChevronLeft, Home, Map, UserRound } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { cn } from '../lib/cn'
import type { ReactNode } from 'react'

const customerNav = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/mapa', label: 'Mapa', icon: Map, end: false },
  { to: '/citas', label: 'Mis citas', icon: CalendarDays, end: false },
  { to: '/perfil', label: 'Perfil', icon: UserRound, end: false },
]

const barberNav = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/mapa', label: 'Mapa', icon: Map, end: false },
  { to: '/agenda', label: 'Agenda', icon: CalendarClock, end: false },
  { to: '/perfil', label: 'Perfil', icon: UserRound, end: false },
]

function BottomNav() {
  const { user } = useAuth()
  const items = user?.role === 'barbero' ? barberNav : customerNav

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-ink-200/70 bg-stone-50/90 backdrop-blur-xl safe-bottom md:max-w-lg"
    >
      <ul className="grid grid-cols-4 px-2 pb-1 pt-2">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group flex flex-col items-center gap-1 rounded-2xl py-1 text-[11px] font-medium transition',
                  isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-800',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid size-10 place-items-center rounded-2xl transition',
                      isActive ? 'bg-ink-900 text-brand-400 shadow-sm' : 'bg-transparent',
                    )}
                  >
                    <item.icon className="size-[21px]" strokeWidth={isActive ? 2.3 : 1.9} aria-hidden />
                  </span>
                  <span className={cn(isActive && 'font-semibold')}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export function PageHeader({
  title,
  subtitle,
  back = false,
  action,
  transparent = false,
}: {
  title: string
  subtitle?: string
  back?: boolean
  action?: ReactNode
  transparent?: boolean
}) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b safe-top',
        transparent
          ? 'border-transparent bg-transparent'
          : 'border-ink-200/60 bg-stone-50/85 backdrop-blur-xl',
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        {back ? (
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            aria-label="Volver"
            className="grid size-9 place-items-center rounded-full text-ink-700 transition hover:bg-ink-200/60"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold text-ink-900">{title}</h1>
          {subtitle ? <p className="truncate text-[11px] text-ink-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  )
}

export function AppShell() {
  const { pathname } = useLocation()
  const hideNav = pathname.startsWith('/barberia/')

  return (
    <div className="min-h-dvh bg-ink-100 md:bg-[radial-gradient(80%_60%_at_50%_0%,#2a2723_0%,#12100e_70%)]">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-stone-50 app-shadow md:max-w-lg">
        <main className="flex-1">
          <Outlet />
        </main>
        {hideNav ? null : <BottomNav />}
      </div>
    </div>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-ink-100 md:bg-[radial-gradient(80%_60%_at_50%_0%,#2a2723_0%,#12100e_70%)]">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-stone-50 app-shadow md:max-w-lg">
        {children}
      </div>
    </div>
  )
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="BarberApp, ir al inicio"
      className={cn('inline-flex items-center gap-2 text-ink-900', className)}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-ink-900 text-base font-black text-brand-500">
        B
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Barber<span className="text-brand-600">App</span>
      </span>
    </Link>
  )
}
