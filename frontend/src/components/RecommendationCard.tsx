import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Sparkles, Tag } from 'lucide-react'
import { shopTypeShortLabel } from '../data/barbershops'
import type { ShopRecommendation } from '../lib/recommendations'
import { formatPrice } from '../lib/date'
import { formatDistance } from '../lib/geo'
import { Cover } from './ui'

export function RecommendationCard({ recommendation }: { recommendation: ShopRecommendation }) {
  const { shop, service, distance, matchScore } = recommendation

  return (
    <Link
      to={`/barberia/${shop.id}`}
      className="group flex items-center gap-3 rounded-2xl bg-ink-50/70 p-2.5 ring-1 ring-ink-100 transition hover:bg-ink-100"
    >
      <Cover
        src={shop.cover}
        alt={`Interior de ${shop.name}`}
        name={shop.name}
        className="size-16 shrink-0 rounded-2xl"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-bold text-ink-900">{shop.name}</p>
          {shop.offer ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-black text-ink-950">
              <Tag className="size-2.5" aria-hidden />-{shop.offer.discountPercent}%
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink-500">
          <MapPin className="size-3 shrink-0" aria-hidden />
          {formatDistance(distance)} · {shopTypeShortLabel(shop.shopType)}
        </p>

        <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] font-semibold text-brand-700">
          {matchScore > 0 ? <Sparkles className="size-3 shrink-0" aria-hidden /> : null}
          <span className="truncate">{service.name}</span>
          <span className="shrink-0 text-ink-500">· {formatPrice(service.price)}</span>
        </p>
      </div>

      <ChevronRight
        className="size-4 shrink-0 text-ink-400 transition group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  )
}
