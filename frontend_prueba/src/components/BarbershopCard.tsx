import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import type { Barbershop } from '../data/barbershops'
import { formatPrice } from '../lib/date'
import { distanceKm, formatDistance, USER_LOCATION } from '../lib/geo'
import { Badge, Cover, Rating } from './ui'

export function BarbershopCard({ shop }: { shop: Barbershop }) {
  const minPrice = Math.min(...shop.services.map((service) => service.price))
  const distance = distanceKm(USER_LOCATION.lat, USER_LOCATION.lng, shop.lat, shop.lng)
  const isOpen = !shop.closedDays.includes(new Date().getDay())

  return (
    <Link
      to={`/barberia/${shop.id}`}
      className="group block overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200/70 transition active:scale-[0.995] hover:ring-ink-300"
    >
      <Cover src={shop.cover} alt={`Interior de ${shop.name}`} name={shop.name} className="h-40">
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <Badge tone={isOpen ? 'success' : 'neutral'} className="bg-white/90 backdrop-blur">
            <span
              className={`size-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-dot' : 'bg-ink-400'}`}
              aria-hidden
            />
            {isOpen ? 'Abierto ahora' : 'Cerrado hoy'}
          </Badge>
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
        <div className="flex flex-wrap gap-1.5">
          {shop.tags.slice(0, 3).map((tag) => (
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
