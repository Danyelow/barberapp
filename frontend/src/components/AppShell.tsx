import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CalendarClock,
  ChevronLeft,
  Home,
  Map,
  Monitor,
  Smartphone,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useViewMode } from '../layout/ViewModeContext'
import { useProfilePreferences } from '../profile/ProfilePreferencesContext'
import { ThemeToggle } from '../theme/ThemeToggle'
import { cn } from '../lib/cn'
import { Avatar } from './ui'
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

function useNavItems() {
  const { user } = useAuth()
  return user?.role === 'barbero' ? barberNav : customerNav
}

function BottomNav() {
  const items = useNavItems()

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

function DesktopSidebar() {
  const { user } = useAuth()
  const { photo } = useProfilePreferences()
  const { setPreference } = useViewMode()
  const items = useNavItems()

  return (
    <aside className="sticky top-0 flex h-dvh w-64 shrink-0 flex-col border-r border-ink-200/80 bg-white/90 px-4 py-5 backdrop-blur-xl">
      <BrandMark />

      <div className="mt-7 flex items-center gap-2 rounded-2xl bg-ink-50 px-3 py-2 text-[11px] text-ink-500 ring-1 ring-ink-100">
        <Monitor className="size-3.5 text-brand-600" aria-hidden />
        <span className="font-semibold text-ink-700">Vista PC</span>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
          PWA
        </span>
      </div>

      <nav aria-label="Navegación principal" className="mt-5 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-ink-900 text-white shadow-sm'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn('size-[19px]', isActive ? 'text-brand-400' : 'text-ink-400')}
                  strokeWidth={isActive ? 2.2 : 1.9}
                  aria-hidden
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        {user ? (
          <Link
            to="/perfil"
            className="flex items-center gap-3 rounded-2xl border border-ink-200/80 bg-ink-50/70 p-2.5 transition hover:bg-ink-100"
          >
            <Avatar name={user.name} src={photo} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-900">{user.name}</span>
              <span className="block truncate text-[11px] text-ink-500">
                {user.role === 'barbero' ? 'Barbero/a' : 'Cliente'}
              </span>
            </span>
          </Link>
        ) : null}

        <ThemeToggle showLabel />

        <button
          type="button"
          onClick={() => setPreference('mobile')}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
        >
          <Smartphone className="size-4" aria-hidden />
          Cambiar a vista móvil
        </button>
        <p className="px-2.5 text-[10px] leading-relaxed text-ink-400">
          En Perfil puedes elegir entre vista automática, PC o móvil.
        </p>
      </div>
    </aside>
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
      <div className="page-container flex h-14 items-center gap-2 px-3">
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
  const { isDesktop } = useViewMode()
  const hideNav = pathname.startsWith('/barberia/')

  if (isDesktop) {
    return (
      <div className="min-h-dvh bg-stone-100">
        <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] bg-stone-50">
          <DesktopSidebar />
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

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
  const { isDesktop, setPreference } = useViewMode()

  if (isDesktop) {
    return (
      <div className="min-h-dvh bg-ink-950 p-5 lg:p-8">
        <div className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl overflow-hidden rounded-[32px] bg-stone-50 shadow-2xl lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative hidden overflow-hidden bg-ink-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=80"
              alt="Interior de una barbería clásica"
              className="absolute inset-0 size-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/55 to-ink-950/95" />
            <div className="relative flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-brand-500 text-lg font-black text-ink-950">
                B
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                Barber<span className="text-brand-400">App</span>
              </span>
            </div>
            <div className="relative max-w-md">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300 ring-1 ring-white/15 backdrop-blur">
                <Sparkles className="size-3" aria-hidden />
                Sevilla
              </span>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight">
                Tu próxima cita,
                <br />
                sin llamadas.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
                Encuentra peluquerías cerca de ti, descubre sus ofertas y reserva en menos de un
                minuto.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreference('mobile')}
              className="relative inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15 hover:text-white"
            >
              <Smartphone className="size-4" aria-hidden />
              Cambiar a vista móvil
            </button>
          </aside>

          <div className="auth-content flex min-h-[calc(100dvh-2.5rem)] flex-col overflow-y-auto bg-stone-50 lg:min-h-[calc(100dvh-4rem)]">
            {children}
          </div>
        </div>
      </div>
    )
  }

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
