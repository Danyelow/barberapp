import * as L from 'leaflet'
import { MapContainer, Marker, TileLayer, Tooltip, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Barbershop } from '../data/barbershops'
import { formatPrice } from '../lib/date'
import { USER_LOCATION } from '../lib/geo'

const priceIcon = (shop: Barbershop, selected: boolean) =>
  L.divIcon({
    className: 'barber-pin',
    html: `<div style="
        display:inline-flex;align-items:center;justify-content:center;
        padding:6px 10px;border-radius:999px;
        background:${selected ? '#1c1a17' : '#ffffff'};
        color:${selected ? '#ffb765' : '#1c1a17'};
        border:2px solid ${selected ? '#f98207' : '#ffffff'};
        box-shadow:0 8px 20px rgba(18,16,14,.28);
        font:700 12px/1 Inter,system-ui,sans-serif;white-space:nowrap;
        transition:all .15s ease;
      ">desde ${formatPrice(Math.min(...shop.services.map((service) => service.price)))}</div>`,
    iconSize: [92, 32],
    iconAnchor: [46, 34],
  })

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

export function MapView({
  shops,
  selectedId,
  onSelect,
}: {
  shops: Barbershop[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <MapContainer
      center={[USER_LOCATION.lat, USER_LOCATION.lng]}
      zoom={14}
      zoomControl={false}
      scrollWheelZoom={false}
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      <Marker position={[USER_LOCATION.lat, USER_LOCATION.lng]} icon={userIcon} zIndexOffset={500}>
        <Tooltip direction="top" offset={[0, -10]}>
          Estás aquí
        </Tooltip>
      </Marker>
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
