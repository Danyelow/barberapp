import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, List, Loader2, LocateFixed, MapPin, Navigation, X } from 'lucide-react'
import { mockApi } from '../api/mockApi'
import { useAuth } from '../auth/AuthContext'
import { MapView } from '../components/MapView'
import { Rating, Skeleton } from '../components/ui'
import { formatPrice } from '../lib/date'
import { distanceKm, formatDistance, USER_LOCATION } from '../lib/geo'
import { canRequestService } from '../lib/services'
import { useUserLocation } from '../lib/useUserLocation'
import { shopTypeShortLabel } from '../data/barbershops'
import type { Barbershop } from '../data/barbershops'

export function MapPage() {
  const { user } = useAuth()
  const [shops, setShops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('shop')
  const { coords, status, request } = useUserLocation({ requestOnMount: true })

  useEffect(() => {
    let alive = true
    void mockApi.listShops().then((result) => {
      if (!alive) return
      setShops(result)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const select = (id: string | null) => {
    const next = new URLSearchParams(params)
    if (id) next.set('shop', id)
    else next.delete('shop')
    setParams(next, { replace: true })
  }

  const displayShops = useMemo(
    () =>
      shops.map((shop) => {
        const services = shop.services.filter((service) => canRequestService(service, user))
        return services.length && services.length !== shop.services.length
          ? { ...shop, services }
          : shop
      }),
    [shops, user],
  )

  const origin = coords ?? USER_LOCATION
  const orderedShops = useMemo(() => {
    const from = coords ?? USER_LOCATION
    return [...displayShops].sort(
      (a, b) =>
        distanceKm(from.lat, from.lng, a.lat, a.lng) -
        distanceKm(from.lat, from.lng, b.lat, b.lng),
    )
  }, [displayShops, coords])

  const shop = displayShops.find((item) => item.id === selectedId) ?? null
  const distance = shop ? distanceKm(origin.lat, origin.lng, shop.lat, shop.lng) : 0
  const locating = status === 'requesting'

  const headline =
    status === 'granted' && coords
      ? 'Peluquerías cerca de ti'
      : locating
        ? 'Buscando tu ubicación…'
        : status === 'denied'
          ? 'Ubicación desactivada'
          : status === 'unsupported'
            ? 'Ubicación no disponible'
            : 'Peluquerías en Sevilla'

  const subline =
    status === 'granted' && coords
      ? `${shops.length} peluquerías · ordenadas por cercanía`
      : locating
        ? 'Permite el acceso para ordenar por cercanía'
        : status === 'denied'
          ? 'Actívala en el navegador y pulsa el botón'
          : status === 'unavailable'
            ? 'No pudimos ubicarte · mostrando Sevilla'
            : status === 'unsupported'
              ? 'Tu navegador no permite geolocalización'
              : `${shops.length} peluquerías en el mapa`

  return (
    <div className="flex h-[calc(100dvh-90px-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden bg-stone-50">
      <div className="z-10 shrink-0 p-3 safe-top">
        <div className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-3 shadow-lg ring-1 ring-ink-200/70">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-ink-900 text-brand-400">
            <MapPin className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold leading-tight text-ink-900">{headline}</p>
            <p className="truncate text-[11px] text-ink-500">{subline}</p>
          </div>
          <button
            type="button"
            onClick={request}
            disabled={locating}
            aria-label="Actualizar mi ubicación"
            title="Actualizar mi ubicación"
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-700 transition hover:bg-ink-200 disabled:cursor-wait"
          >
            {locating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LocateFixed className="size-4" aria-hidden />
            )}
          </button>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-ink-100 px-2.5 py-2 text-[11px] font-bold text-ink-700 transition hover:bg-ink-200"
          >
            <List className="size-3.5" aria-hidden />
            Lista
          </Link>
        </div>

        {status === 'denied' ? (
          <p className="mt-2 rounded-xl bg-ink-950/85 px-3 py-2 text-[11px] leading-snug text-white/85 shadow-lg">
            Si ya bloqueaste la ubicación, actívala en los ajustes del navegador para este sitio y
            vuelve a intentarlo.
          </p>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-ink-200">
        {loading ? (
          <Skeleton className="size-full rounded-none" />
        ) : (
          <MapView
            shops={orderedShops}
            selectedId={selectedId}
            onSelect={select}
            userLocation={coords}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3">
          {shop ? (
            <div className="pointer-events-auto animate-rise overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-ink-900/10">
              <div className="flex gap-3 p-3">
                <img
                  src={shop.cover}
                  alt={shop.name}
                  loading="lazy"
                  className="size-24 shrink-0 rounded-2xl object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-bold leading-tight text-ink-900">
                        {shop.name}
                      </h2>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-ink-500">
                        <Navigation className="size-3 shrink-0" aria-hidden />
                        {formatDistance(distance)} · {shop.address}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => select(null)}
                      aria-label="Cerrar ficha"
                      className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-400 hover:bg-ink-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-500">
                    <Rating value={shop.rating} count={shop.reviews} className="text-ink-800" />
                    <span aria-hidden>·</span>
                    <span>{shopTypeShortLabel(shop.shopType)}</span>
                    <span aria-hidden>·</span>
                    <span>
                      Desde{' '}
                      {formatPrice(Math.min(...shop.services.map((service) => service.price)))}
                    </span>
                  </div>
                  <Link
                    to={`/barberia/${shop.id}`}
                    className="mt-2.5 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-ink-900 text-[13px] font-semibold text-white transition hover:bg-ink-800"
                  >
                    Ver peluquería y reservar
                    <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="pointer-events-auto mx-auto w-fit rounded-full bg-ink-950/85 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur">
              Toca una peluquería para verla
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
