export interface Barber {
  id: number
  name: string
  specialty: string | null
}

export interface PingResponse {
  status: string
  service: string
  timestamp: string
}

// Por defecto se usa el proxy de Vite (/api -> http://localhost:8080).
// En producción se puede apuntar a otra URL con VITE_API_BASE_URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Error ${res.status} al llamar a ${url}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  ping: () => json<PingResponse>('/ping'),
  listBarbers: () => json<Barber[]>('/barbers'),
  createBarber: (name: string, specialty: string) =>
    json<Barber>('/barbers', {
      method: 'POST',
      body: JSON.stringify({ name, specialty }),
    }),
}