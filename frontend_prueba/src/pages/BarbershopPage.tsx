import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Phone,
  Scissors,
  Share2,
  Star,
} from 'lucide-react'
import { mockApi } from '../api/mockApi'
import { Avatar, Badge, Cover, EmptyState, Rating, Skeleton } from '../components/ui'
import { useToast } from '../ui/ToastContext'
import { durationLabel, formatPrice } from '../lib/date'
import { distanceKm, formatDistance, USER_LOCATION } from '../lib/geo'
import { cn } from '../lib/cn'
import type { Barbershop } from '../data/barbershops'

const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function BarbershopPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [shop, setShop] = useState<Barbershop | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    if (!id) return
    void mockApi.getShop(id).then((result) => {
      if (!alive) return
      setShop(result)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [id])

  const openNow = useMemo(() => {
    if (!shop) return false
    const now = new Date()
    if (shop.closedDays.includes(now.getDay())) return false
    const [openH, openM] = shop.opensAt.split(':').map(Number)
    const [closeH, closeM] = shop.closesAt.split(':').map(Number)
    const minutes = now.getHours() * 60 + now.getMinutes()
    return minutes >= openH * 60 + openM && minutes <= closeH * 60 + closeM
  }, [shop])

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: shop?.name ?? 'BarberApp', url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast('Enlace copiado al portapapeles', 'info')
    } catch {
      toast('No se pudo compartir el enlace', 'error')
    }
  }

  if (loading) {
    return (
      <div className="pb-32">
        <Skeleton className="h-72 rounded-none" />
        <div className="space-y-4 px-4 pt-5">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="px-4 py-16">
        <EmptyState
          icon={<Scissors className="size-5" />}
          title="Barbería no encontrada"
          message="Puede que el enlace ya no esté disponible."
          action={
            <Link to="/" className="text-sm font-semibold text-brand-700 underline underline-offset-4">
              Volver al inicio
            </Link>
          }
        />
      </div>
    )
  }

  const distance = distanceKm(USER_LOCATION.lat, USER_LOCATION.lng, shop.lat, shop.lng)
  const days = [1, 2, 3, 4, 5, 6].filter((day) => !shop.closedDays.includes(day))

  return (
    <div className="pb-32">
      <Cover src={shop.cover} alt={`Barbería ${shop.name}`} name={shop.name} className="h-72">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 safe-top">
          <Link
            to="/"
            aria-label="Volver"
            className="grid size-10 place-items-center rounded-full bg-ink-950/40 text-white backdrop-blur transition hover:bg-ink-950/60"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFavorite((value) => !value)}
              aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              aria-pressed={favorite}
              className="grid size-10 place-items-center rounded-full bg-ink-950/40 text-white backdrop-blur transition hover:bg-ink-950/60"
            >
              <Heart className={cn('size-5', favorite && 'fill-red-500 text-red-500')} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => void share()}
              aria-label="Compartir barbería"
              className="grid size-10 place-items-center rounded-full bg-ink-950/40 text-white backdrop-blur transition hover:bg-ink-950/60"
            >
              <Share2 className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={openNow ? 'success' : 'neutral'} className="bg-white/90 backdrop-blur">
              <span className={cn('size-1.5 rounded-full', openNow ? 'bg-emerald-500 animate-dot' : 'bg-ink-400')} aria-hidden />
              {openNow ? 'Abierto ahora' : 'Cerrado ahora'}
            </Badge>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {'€'.repeat(shop.priceLevel)}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-white drop-shadow">{shop.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/85">
            <Rating value={shop.rating} count={shop.reviews} className="text-white" />
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {formatDistance(distance)}
            </span>
          </div>
        </div>
      </Cover>

      <div className="relative -mt-6 rounded-t-[28px] bg-stone-50 px-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-800">{shop.address}</p>
            <p className="text-xs text-ink-500">{shop.city} · Madrid</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <BadgeCheck className="size-3.5" aria-hidden />
            Verificada
          </span>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-ink-600">{shop.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={`tel:${shop.phone.replace(/\s/g, '')}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-ink-800 ring-1 ring-ink-200 transition hover:bg-ink-50"
          >
            <Phone className="size-4" aria-hidden />
            Llamar
          </a>
          <Link
            to={`/mapa?shop=${shop.id}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-ink-800 ring-1 ring-ink-200 transition hover:bg-ink-50"
          >
            <MapPin className="size-4" aria-hidden />
            Ver en mapa
          </Link>
        </div>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink-900">Servicios</h2>
            <span className="text-[11px] font-medium text-ink-500">{shop.services.length} disponibles</span>
          </div>
          <div className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200/70">
            {shop.services.map((service) => (
              <Link
                key={service.id}
                to={`/barberia/${shop.id}/reservar?servicio=${service.id}`}
                className="group flex items-center gap-3 p-4 transition hover:bg-ink-50/70"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{service.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{service.description}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-500">
                    <Clock className="size-3" aria-hidden />
                    {durationLabel(service.durationMin)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-bold text-ink-900">{formatPrice(service.price)}</span>
                  <span className="grid size-9 place-items-center rounded-xl bg-ink-900 text-white transition group-hover:bg-brand-500 group-hover:text-ink-950">
                    <ChevronRight className="size-4" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-base font-bold text-ink-900">El equipo</h2>
          <div className="-mx-4 mt-3 overflow-x-auto px-4 no-scrollbar">
            <div className="flex gap-3">
              {shop.barbers.map((barber) => (
                <article
                  key={barber.id}
                  className="w-40 shrink-0 rounded-3xl bg-white p-4 ring-1 ring-ink-200/70"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={barber.name} size="lg" />
                  </div>
                  <p className="mt-3 text-sm font-bold leading-tight text-ink-900">{barber.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">{barber.specialty}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-ink-700">
                      <Star className="size-3 fill-brand-400 text-brand-400" aria-hidden />
                      {barber.rating.toFixed(1)}
                    </span>
                    <span>{barber.years} años exp.</span>
                  </div>
                  <Link
                    to={`/barberia/${shop.id}/reservar?barbero=${barber.id}`}
                    className="mt-3 flex h-9 items-center justify-center rounded-xl bg-ink-100 text-[12px] font-semibold text-ink-800 transition hover:bg-ink-200"
                  >
                    Reservar con {barber.name.split(' ')[0]}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-4 ring-1 ring-ink-200/70">
          <h2 className="text-base font-bold text-ink-900">Horario</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-ink-600">{days.length ? `${weekdays[days[0]]} a ${weekdays[days[days.length - 1]]}` : 'Sin días'}</dt>
              <dd className="font-semibold text-ink-900">
                {shop.opensAt} – {shop.closesAt}
              </dd>
            </div>
            {shop.closedDays.map((day) => (
              <div key={day} className="flex items-center justify-between">
                <dt className="text-ink-600">{weekdays[day]}</dt>
                <dd className="font-medium text-ink-400">Cerrado</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 flex items-center gap-1.5 border-t border-ink-100 pt-3 text-[11px] text-ink-500">
            <Scissors className="size-3.5" aria-hidden />
            {shop.barbers.length} barberos · Reserva con cancelación gratuita
          </p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-ink-200/70 bg-stone-50/95 px-4 pb-3 pt-3 backdrop-blur-xl safe-bottom md:max-w-lg">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-ink-500">Desde</p>
            <p className="text-lg font-extrabold leading-none text-ink-900">
              {formatPrice(Math.min(...shop.services.map((service) => service.price)))}
            </p>
          </div>
          <Link
            to={`/barberia/${shop.id}/reservar`}
            className="ml-auto inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-ink-900 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-ink-800 active:scale-[0.99]"
          >
            <Scissors className="size-4" aria-hidden />
            Reservar cita
          </Link>
        </div>
      </div>
    </div>
  )
}
