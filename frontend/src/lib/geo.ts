/** Distancia aproximada en km entre dos coordenadas (haversine). */
export const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earth = 6371
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
  return earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export type Coordinates = { lat: number; lng: number }

/** Posición de respaldo (centro de Sevilla) si el usuario no concede ubicación. */
export const USER_LOCATION: Coordinates = { lat: 37.3891, lng: -5.9845 }

export const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`
