import { useCallback, useEffect, useRef, useState } from 'react'
import type { Coordinates } from './geo'

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'unsupported'

const CACHE_KEY = 'barberapp.location.v1'
const CACHE_TTL = 10 * 60 * 1000

const readCache = (): Coordinates | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Coordinates & { at?: number }
    if (typeof parsed.lat !== 'number' || typeof parsed.lng !== 'number') return null
    if (typeof parsed.at === 'number' && Date.now() - parsed.at > CACHE_TTL) return null
    return { lat: parsed.lat, lng: parsed.lng }
  } catch {
    return null
  }
}

const writeCache = (coords: Coordinates) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...coords, at: Date.now() }))
  } catch {
    /* almacenamiento no disponible: seguimos usando la posición en memoria */
  }
}

/**
 * Pide la ubicación real al navegador (solo cuando `requestOnMount` es true).
 * Si ya hay una posición reciente en caché, se muestra mientras se refresca.
 * En páginas sin petición (p. ej. detalle de barbería) reutiliza la caché.
 */
export function useUserLocation({ requestOnMount = false }: { requestOnMount?: boolean } = {}) {
  const [coords, setCoords] = useState<Coordinates | null>(() => readCache())
  const [status, setStatus] = useState<LocationStatus>(coords ? 'granted' : 'idle')
  const coordsRef = useRef<Coordinates | null>(coords)
  const requestedOnMount = useRef(false)

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }

    if (!coordsRef.current) setStatus('requesting')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude }
        coordsRef.current = next
        setCoords(next)
        setStatus('granted')
        writeCache(next)
      },
      (error) => {
        if (coordsRef.current) return
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  useEffect(() => {
    if (!requestOnMount || requestedOnMount.current) return
    requestedOnMount.current = true
    request()
  }, [requestOnMount, request])

  return { coords, status, request }
}
