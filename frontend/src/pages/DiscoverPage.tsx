import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck2,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { mockApi } from '../api/mockApi'
import { useAuth } from '../auth/AuthContext'
import { BarbershopCard } from '../components/BarbershopCard'
import { useBookings } from '../store/BookingsContext'
import { findBarbershop, findService } from '../data/barbershops'
import { formatPrice, relativeDayLabel } from '../lib/date'
import { distanceKm, USER_LOCATION } from '../lib/geo'
import { useUserLocation } from '../lib/useUserLocation'
import { cn } from '../lib/cn'
import { Avatar, EmptyState, Skeleton } from '../components/ui'
import type { Barbershop, ShopType } from '../data/barbershops'

type ShopTypeFilter = 'todos' | ShopType

const shopTypeFilters: { id: ShopTypeFilter; label: string }[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'hombres', label: 'Hombres' },
  { id: 'mujeres', label: 'Mujeres' },
]

export function DiscoverPage() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const { coords, status, request } = useUserLocation({ requestOnMount: true })
  const [shops, setShops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [shopType, setShopType] = useState<ShopTypeFilter>('todos')

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

  const visible = useMemo(() => {
    const from = coords ?? USER_LOCATION
    return shops
      .filter((shop) => shopType === 'todos' || shop.shopType === shopType)
      .sort(
        (a, b) =>
          distanceKm(from.lat, from.lng, a.lat, a.lng) -
          distanceKm(from.lat, from.lng, b.lat, b.lng),
      )
  }, [shops, shopType, coords])

  const locating = status === 'requesting'
  const typeLabel =
    shopType === 'todos'
      ? 'peluquerías'
      : shopType === 'hombres'
        ? 'peluquerías de hombres'
        : 'peluquerías de mujeres'

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
                placeholder="Peluquería, zona o servicio"
                aria-label="Buscar peluquerías"
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

        <section className="relative overflow-hidden rounded-3xl bg-ink-950 p-5 text-white">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Puente_de_Triana_de_noche.jpg/1280px-Puente_de_Triana_de_noche.jpg"
            alt="Puente de Triana sobre el río Guadalquivir al anochecer"
            className="absolute inset-0 size-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/75 to-ink-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent" />
          <div className="relative">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
              <Sparkles className="size-3" aria-hidden />
              Reserva en 30 s
            </span>
            <h2 className="mt-2 max-w-[16rem] text-2xl font-extrabold leading-tight">
              Tu próximo look, a un toque.
            </h2>
            <p className="mt-1 max-w-[17rem] text-[13px] font-medium text-white/75">
              Elige peluquería, profesional y hora. Sin llamadas, sin esperas.
            </p>
            <Link
              to="/mapa"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-sm transition hover:bg-brand-400"
            >
              <MapPin className="size-4" aria-hidden />
              Explorar mapa
            </Link>
            <p className="mt-3 text-[10px] font-medium text-white/60">Puente de Triana · Sevilla</p>
          </div>
        </section>

        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
          <div className="flex gap-2">
            {shopTypeFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setShopType(item.id)}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition',
                  shopType === item.id
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink-900">Cerca de ti</h2>
              <p className="text-xs text-ink-500">
                {loading
                  ? 'Buscando peluquerías…'
                  : locating
                    ? 'Buscando tu ubicación…'
                    : `${visible.length} ${typeLabel} ${coords ? 'ordenadas por cercanía' : 'en Sevilla'}`}
              </p>
            </div>
            <button
              type="button"
              onClick={request}
              disabled={locating}
              className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-100 disabled:cursor-wait disabled:opacity-60"
              aria-label="Actualizar mi ubicación"
              title="Actualizar mi ubicación"
            >
              {locating ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <LocateFixed className="size-3.5" aria-hidden />
              )}
              {coords ? 'Actualizar' : 'Ubicación'}
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
                <BarbershopCard key={shop.id} shop={shop} location={coords} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="size-5" />}
              title="Sin resultados"
              message={
                query.trim()
                  ? `No encontramos peluquerías para “${query}”. Prueba con otra zona o servicio.`
                  : 'No hay peluquerías de este tipo. Prueba con el otro tipo de peluquería.'
              }
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setShopType('todos')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  <X className="size-3.5" aria-hidden />
                  Limpiar filtros
                </button>
              }
            />
          )}
        </section>

        <section className="rounded-3xl border border-ink-200 bg-white p-4">
          <h2 className="text-sm font-bold text-ink-900">¿Cómo funciona?</h2>
          <ol className="mt-3 space-y-3">
            {[
              'Elige peluquería de hombres o de mujeres.',
              'Busca una cerca de ti y revisa sus servicios.',
              'Reserva servicio, profesional, día y hora. Listo.',
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
