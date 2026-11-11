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
  Tag,
  X,
} from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../auth/AuthContext'
import { BarbershopCard } from '../components/BarbershopCard'
import { useProfilePreferences } from '../profile/ProfilePreferencesContext'
import { useBookings } from '../store/BookingsContext'
import { formatPrice, formatShortDate, relativeDayLabel, toISODate } from '../lib/date'
import { distanceKm, formatDistance, USER_LOCATION } from '../lib/geo'
import type { Coordinates } from '../lib/geo'
import { nearbyOffers, sortShopsByProximity } from '../lib/offers'
import { useUserLocation } from '../lib/useUserLocation'
import { cn } from '../lib/cn'
import { Avatar, Badge, EmptyState, Skeleton } from '../components/ui'
import type { Barbershop, ShopType } from '../data/barbershops'

type ShopTypeFilter = 'todos' | ShopType

const shopTypeFilters: { id: ShopTypeFilter; label: string }[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'hombres', label: 'Hombres' },
  { id: 'mujeres', label: 'Mujeres' },
  { id: 'unisex', label: 'Unisex' },
]

export function DiscoverPage() {
  const { user } = useAuth()
  const { photo } = useProfilePreferences()
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
        void api
          .listShops(query)
          .then((result) => {
            if (!alive) return
            setShops(result)
            setLoading(false)
          })
          .catch(() => {
            if (!alive) return
            setShops([])
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
    return sortShopsByProximity(
      shops.filter((shop) => shopType === 'todos' || shop.shopType === shopType),
      from,
    )
  }, [shops, shopType, coords])

  const offersNearby = useMemo(() => {
    const from = coords ?? USER_LOCATION
    return nearbyOffers(visible, from).slice(0, 4)
  }, [visible, coords])

  const locating = status === 'requesting'
  const typeLabel =
    shopType === 'todos'
      ? 'peluquerías'
      : shopType === 'hombres'
        ? 'peluquerías de hombres'
        : shopType === 'mujeres'
          ? 'peluquerías de mujeres'
          : 'peluquerías unisex'

  const nextBooking = useMemo(() => {
    if (!user || user.role !== 'cliente') return null
    const today = toISODate(new Date())
    return bookings
      .filter(
        (booking) =>
          booking.userId === user.id &&
          booking.date >= today &&
          (booking.status === 'pendiente' || booking.status === 'confirmada'),
      )
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
  }, [bookings, user])

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-stone-50/90 backdrop-blur-xl safe-top">
        <div className="page-container flex items-center gap-3 px-4 pb-2 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">BarberApp</p>
            <h1 className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-ink-900">
              Hola, {user ? user.name.split(' ')[0] : 'vecino'}
            </h1>
          </div>
          <Link to="/perfil" aria-label="Ver perfil">
            <Avatar name={user?.name ?? 'Invitado'} src={photo} />
          </Link>
        </div>

        <div className="page-container px-4 pb-3">
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

      <div className="page-container space-y-6 px-4 pt-4">
        {nextBooking ? (
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
                {nextBooking.barbershopName} · {nextBooking.serviceName}
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

        {offersNearby.length ? (
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-1.5 text-base font-bold text-ink-900">
                  <Tag className="size-4 text-brand-600" aria-hidden />
                  Ofertas cerca de ti
                </h2>
                <p className="text-xs text-ink-500">
                  Descuentos activos a menos de 6 km, ordenados por cercanía
                </p>
              </div>
              <Badge tone="warning">{offersNearby.length} activas</Badge>
            </div>
            <div className="-mx-4 overflow-x-auto px-4 pb-1 no-scrollbar">
              <div className="flex gap-3">
                {offersNearby.map((shop) => (
                  <OfferCard key={shop.id} shop={shop} from={coords ?? USER_LOCATION} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink-900">Cerca de ti</h2>
              <p className="text-xs text-ink-500">
                {loading
                  ? 'Buscando peluquerías…'
                  : locating
                    ? 'Buscando tu ubicación…'
                    : `${visible.length} ${typeLabel} ${coords ? 'ordenadas por cercanía y ofertas' : 'en Sevilla'}`}
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
            <div className="shop-grid">
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
            <div className="shop-grid">
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
                  : 'No hay peluquerías de este tipo. Prueba con otro filtro.'
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
              'Elige peluquería de hombres, de mujeres o unisex.',
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
          {nextBooking ? (
            <p className="mt-3 border-t border-ink-100 pt-3 text-xs text-ink-500">
              Tu próximo servicio:{' '}
              <strong className="text-ink-700">{nextBooking.serviceName}</strong> ·{' '}
              {formatPrice(nextBooking.price)}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function OfferCard({ shop, from }: { shop: Barbershop; from: Coordinates }) {
  const offer = shop.offer
  if (!offer) return null
  const distance = distanceKm(from.lat, from.lng, shop.lat, shop.lng)

  return (
    <Link
      to={`/barberia/${shop.id}`}
      className="group relative flex min-h-44 w-[280px] shrink-0 flex-col overflow-hidden rounded-3xl bg-ink-950 p-4 text-white shadow-lg ring-1 ring-ink-900/10 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-[320px]"
    >
      <img
        src={shop.cover}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover opacity-30 transition duration-500 group-hover:scale-105 group-hover:opacity-40"
        onError={(event) => {
          event.currentTarget.style.display = 'none'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950/90 via-ink-950/65 to-brand-900/35" />

      <div className="relative flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-950">
          <Tag className="size-3" aria-hidden />
          Oferta
        </span>
        <span className="grid size-11 place-items-center rounded-full bg-white/15 text-sm font-black text-brand-300 ring-1 ring-white/20 backdrop-blur">
          -{offer.discountPercent}%
        </span>
      </div>

      <div className="relative mt-3 flex-1">
        <h3 className="text-base font-extrabold leading-tight">{shop.name}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-white/75">{offer.title}</p>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-2 text-[11px] text-white/65">
        <span>
          {formatDistance(distance)}
          {offer.validUntil ? ` · hasta ${formatShortDate(offer.validUntil)}` : ''}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-brand-300">
          Ver oferta
          <ArrowRight className="size-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  )
}
