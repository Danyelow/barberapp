import * as L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Barbershop } from '../data/barbershops'
import { formatPrice } from '../lib/date'
import { USER_LOCATION } from '../lib/geo'
import type { Coordinates } from '../lib/geo'

const priceIcon = (shop: Barbershop, selected: boolean) => {
  const price = Math.min(...shop.services.map((service) => service.price))
  const label = shop.offer
    ? `-${shop.offer.discountPercent}% · ${formatPrice(price)}`
    : `desde ${formatPrice(price)}`

  return L.divIcon({
    className: 'barber-pin',
    html: `<div style="
        display:inline-flex;align-items:center;justify-content:center;
        padding:6px 10px;border-radius:999px;
        background:${selected ? '#1c1a17' : shop.offer ? '#f98207' : 'var(--map-pin-bg, #ffffff)'};
        color:${selected ? '#ffb765' : shop.offer ? '#1c1a17' : 'var(--map-pin-text, #1c1a17)'};
        border:2px solid ${selected ? '#f98207' : shop.offer ? '#f98207' : 'var(--map-pin-bg, #ffffff)'};
        box-shadow:0 8px 20px rgba(18,16,14,.28);
        font:700 12px/1 Inter,system-ui,sans-serif;white-space:nowrap;
        transition:all .15s ease;
      ">${label}</div>`,
    iconSize: [112, 32],
    iconAnchor: [56, 34],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: `<span style="
      display:block;width:16px;height:16px;border-radius:999px;
      background:#f98207;border:3px solid #fff;
      box-shadow:0 0 0 6px rgba(249,130,7,.22), 0 4px 10px rgba(0,0,0,.3);
    "></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function RecenterOnUser({ coords }: { coords: Coordinates | null }) {
  const map = useMap()

  useEffect(() => {
    if (!coords) return
    map.flyTo([coords.lat, coords.lng], Math.max(map.getZoom(), 14), { duration: 0.8 })
  }, [coords, map])

  return null
}

export function MapView({
  shops,
  selectedId,
  onSelect,
  userLocation,
}: {
  shops: Barbershop[]
  selectedId: string | null
  onSelect: (id: string) => void
  userLocation: Coordinates | null
}) {
  const center = userLocation ?? USER_LOCATION

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      zoomControl={false}
      scrollWheelZoom
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      <RecenterOnUser coords={userLocation} />
      {userLocation ? (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
          zIndexOffset={500}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            Estás aquí
          </Tooltip>
        </Marker>
      ) : null}
      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={[shop.lat, shop.lng]}
          icon={priceIcon(shop, selectedId === shop.id)}
          eventHandlers={{ click: () => onSelect(shop.id) }}
          zIndexOffset={selectedId === shop.id ? 400 : 0}
        >
          <Tooltip direction="top" offset={[0, -30]} opacity={1}>
            <span className="font-semibold">{shop.name}</span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}
