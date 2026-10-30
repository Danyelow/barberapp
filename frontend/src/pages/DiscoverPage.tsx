import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { mockApi } from '../api/mockApi'
import { useAuth } from '../auth/AuthContext'
import { BarbershopCard } from '../components/BarbershopCard'
import { useBookings } from '../store/BookingsContext'
import { findBarbershop, findService } from '../data/barbershops'
import { formatPrice, relativeDayLabel } from '../lib/date'
import { cn } from '../lib/cn'
import { Avatar, EmptyState, Skeleton } from '../components/ui'
import type { Barbershop } from '../data/barbershops'

const filters = ['Todos', 'Fade', 'Barba', 'Clásico', 'Rizos', 'Económico']

export function DiscoverPage() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const [shops, setShops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todos')

  useEffect(() => {
    let alive = true
    setLoading(true)
    const timer = setTimeout(
      () => {
        void mockApi.listShops(query).then((result) => {
          if (!alive) return
          setShops(result)
          setLoading(false)
        })
      },
      query.trim() ? 220 : 0,
    )
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [query])

  const visible = useMemo(
    () =>
      shops.filter(
        (shop) =>
          filter === 'Todos' ||
          shop.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase())) ||
          shop.services.some((service) => service.name.toLowerCase().includes(filter.toLowerCase())),
      ),
    [shops, filter],
  )

  const nextBooking = useMemo(() => {
    if (!user || user.role !== 'cliente') return null
    const today = new Date().toISOString().slice(0, 10)
    return bookings
      .filter(
        (booking) =>
          booking.userId === user.id &&
          booking.date >= today &&
          (booking.status === 'pendiente' || booking.status === 'confirmada'),
      )
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
  }, [bookings, user])

  const nextShop = nextBooking ? findBarbershop(nextBooking.barbershopId) : null
  const nextService = nextBooking ? findService(nextBooking.barbershopId, nextBooking.serviceId) : null

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-stone-50/90 backdrop-blur-xl safe-top">
        <div className="flex items-center gap-3 px-4 pb-2 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">BarberApp</p>
            <h1 className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-ink-900">
              Hola, {user ? user.name.split(' ')[0] : 'vecino'}
            </h1>
          </div>
          <Link to="/perfil" aria-label="Ver perfil">
            <Avatar name={user?.name ?? 'Invitado'} />
          </Link>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Barbería, servicio o zona"
                aria-label="Buscar barberías"
                className="h-11 w-full rounded-2xl bg-white pl-10 pr-4 text-sm text-ink-900 ring-1 ring-ink-200 outline-none transition placeholder:text-ink-400 focus:ring-2 focus:ring-ink-900"
              />
            </div>
            <Link
              to="/mapa"
              aria-label="Abrir mapa"
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink-900 text-white transition hover:bg-ink-800"
            >
              <MapPin className="size-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 pt-4">
        {nextBooking && nextShop ? (
          <Link
            to="/citas"
            className="flex items-center gap-3 rounded-3xl bg-ink-900 p-4 text-white shadow-lg shadow-ink-900/15 transition active:scale-[0.99]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-500/20 text-brand-400">
              <CalendarCheck2 className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
                Tu próxima cita
              </p>
              <p className="truncate text-sm font-semibold">
                {nextShop.name} · {nextService?.name}
              </p>
              <p className="text-xs text-white/60">
                {relativeDayLabel(nextBooking.date)} a las {nextBooking.time}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-white/50" aria-hidden />
          </Link>
        ) : null}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-400 to-brand-300 p-5 text-ink-950">
          <div className="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 right-6 size-24 rounded-full bg-ink-900/10 blur-xl" />
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-950/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="size-3" aria-hidden />
            Reserva en 30 s
          </span>
          <h2 className="mt-2 max-w-[16rem] text-2xl font-extrabold leading-tight">
            Tu próximo corte, a un toque.
          </h2>
          <p className="mt-1 max-w-[17rem] text-[13px] font-medium text-ink-900/70">
            Elige barbería, barbero y hora. Sin llamadas, sin esperas.
          </p>
          <Link
            to="/mapa"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ink-900"
          >
            <MapPin className="size-4" aria-hidden />
            Explorar mapa
          </Link>
        </section>

        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
          <div className="flex gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition',
                  filter === item
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink-900">Cerca de ti</h2>
              <p className="text-xs text-ink-500">
                {loading ? 'Buscando barberías…' : `${visible.length} barberías en Madrid`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilter('Todos')}
              className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-100"
            >
              <SlidersHorizontal className="size-3.5" aria-hidden />
              Todos
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200/70">
                  <Skeleton className="h-40 rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length ? (
            <div className="space-y-4">
              {visible.map((shop) => (
                <BarbershopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="size-5" />}
              title="Sin resultados"
              message={`No encontramos barberías para “${query}”. Prueba con otro servicio o zona.`}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setFilter('Todos')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  <X className="size-3.5" aria-hidden />
                  Limpiar búsqueda
                </button>
              }
            />
          )}
        </section>

        <section className="rounded-3xl border border-ink-200 bg-white p-4">
          <h2 className="text-sm font-bold text-ink-900">¿Cómo funciona?</h2>
          <ol className="mt-3 space-y-3">
            {[
              'Busca una barbería cerca de ti.',
              'Elige servicio, barbero, día y hora.',
              'Confirma y listo: te esperamos.',
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-[13px] text-ink-600">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-brand-400">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          {nextService ? (
            <p className="mt-3 border-t border-ink-100 pt-3 text-xs text-ink-500">
              Tu próximo servicio: <strong className="text-ink-700">{nextService.name}</strong> ·{' '}
              {formatPrice(nextService.price)}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}
