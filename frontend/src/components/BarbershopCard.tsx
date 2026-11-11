import { Link } from 'react-router-dom'
import { Clock, MapPin, Tag } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { shopTypeShortLabel } from '../data/barbershops'
import type { Barbershop } from '../data/barbershops'
import { formatPrice, timeToMinutes } from '../lib/date'
import { distanceKm, formatDistance, USER_LOCATION } from '../lib/geo'
import type { Coordinates } from '../lib/geo'
import { canRequestService } from '../lib/services'
import { Badge, Cover, Rating } from './ui'

export function BarbershopCard({
  shop,
  location,
}: {
  shop: Barbershop
  location?: Coordinates | null
}) {
  const { user } = useAuth()
  const availableServices = shop.services.filter((service) => canRequestService(service, user))
  const priceSource = availableServices.length ? availableServices : shop.services
  const minPrice = priceSource.length ? Math.min(...priceSource.map((service) => service.price)) : 0
  const tags =
    user?.gender !== 'hombre'
      ? shop.tags.filter((tag) => !/barba|afeita|navaja/i.test(tag))
      : shop.tags
  const origin = location ?? USER_LOCATION
  const distance = distanceKm(origin.lat, origin.lng, shop.lat, shop.lng)
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const isOpen =
    !shop.closedDays.includes(now.getDay()) &&
    nowMinutes >= timeToMinutes(shop.opensAt) &&
    nowMinutes < timeToMinutes(shop.closesAt)

  return (
    <Link
      to={`/barberia/${shop.id}`}
      className="group block overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200/70 transition active:scale-[0.995] hover:ring-ink-300"
    >
      <Cover src={shop.cover} alt={`Interior de ${shop.name}`} name={shop.name} className="h-40">
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            <Badge tone={isOpen ? 'success' : 'neutral'} className="bg-white/90 backdrop-blur">
              <span
                className={`size-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-dot' : 'bg-ink-400'}`}
                aria-hidden
              />
              {isOpen ? 'Abierto ahora' : 'Cerrado hoy'}
            </Badge>
            {shop.offer ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-ink-950 shadow-sm">
                <Tag className="size-3" aria-hidden />
                Oferta -{shop.offer.discountPercent}%
              </span>
            ) : null}
          </div>
          <span className="rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {formatDistance(distance)}
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-3">
          <h3 className="text-lg font-bold leading-tight text-white drop-shadow">{shop.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-white/80">
            <MapPin className="size-3.5" aria-hidden />
            <span className="truncate">{shop.address}</span>
          </div>
        </div>
      </Cover>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Rating value={shop.rating} count={shop.reviews} className="text-ink-800" />
          <span className="text-xs text-ink-500">
            Desde <strong className="text-sm font-bold text-ink-900">{formatPrice(minPrice)}</strong>
          </span>
        </div>
        {shop.offer ? (
          <div className="flex items-start gap-2 rounded-2xl bg-brand-50 px-3 py-2 ring-1 ring-brand-200">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-500 text-ink-950">
              <Tag className="size-3" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold text-brand-900">{shop.offer.title}</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-brand-700">
                {shop.offer.description}
              </p>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-800 ring-1 ring-brand-200">
            {shopTypeShortLabel(shop.shopType)}
          </span>
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-medium text-ink-600"
            >
              {tag}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-ink-500">
            <Clock className="size-3.5" aria-hidden />
            {shop.opensAt}–{shop.closesAt}
          </span>
        </div>
      </div>
    </Link>
  )
}
