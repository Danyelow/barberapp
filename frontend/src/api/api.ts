import type { Barbershop } from '../data/barbershops'
import type { Booking, BookingDraft, BookingStatus, Gender, User } from '../types'

const TOKEN_KEY = 'barberapp.api.token.v1'
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api'

let token: string | null = readToken()

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function saveToken(value: string | null) {
  token = value
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* almacenamiento no disponible */
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch {
    throw new Error('No se puede conectar con el servidor. Comprueba que Django esté arrancado.')
  }

  if (response.status === 401) {
    saveToken(null)
    window.dispatchEvent(new Event('barberapp:unauthorized'))
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const detail =
      payload && typeof payload === 'object' && 'detail' in payload
        ? String(payload.detail)
        : 'No se pudo completar la operación.'
    throw new Error(detail)
  }

  return payload as T
}

type AuthResponse = { token: string; user: User }

export type RegisterInput = {
  name: string
  email: string
  phone: string
  password: string
  gender: Gender
}

export const api = {
  login: async (email: string, password: string) => {
    const result = await request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    saveToken(result.token)
    return result.user
  },

  register: async (input: RegisterInput) => {
    const result = await request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    saveToken(result.token)
    return result.user
  },

  restoreSession: async () => {
    if (!token) return null
    try {
      const result = await request<{ user: User }>('/auth/me/')
      return result.user
    } catch {
      saveToken(null)
      return null
    }
  },

  logout: async () => {
    try {
      await request<null>('/auth/logout/', { method: 'POST' })
    } catch {
      /* el cierre de sesión local debe funcionar aunque el servidor no responda */
    } finally {
      saveToken(null)
    }
  },

  listShops: (query = '') =>
    request<Barbershop[]>(`/shops/${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`),

  getShop: (id: string) => request<Barbershop>(`/shops/${encodeURIComponent(id)}/`),

  bookings: () => request<Booking[]>('/bookings/'),

  bookedTimes: async (shopId: string, barberId: string, date: string) => {
    const result = await request<{
      times?: string[]
      busy?: { time: string; durationMin: number }[]
    }>(
      `/availability/?shop=${encodeURIComponent(shopId)}&barber=${encodeURIComponent(
        barberId,
      )}&date=${encodeURIComponent(date)}`,
    )
    if (result.busy) return result.busy
    // Compatibilidad con una API antigua que solo devolvía horas de inicio.
    return (result.times ?? []).map((time) => ({ time, durationMin: 30 }))
  },

  createBooking: (draft: BookingDraft) =>
    request<Booking>('/bookings/', {
      method: 'POST',
      body: JSON.stringify({
        barbershopId: draft.barbershopId,
        barberId: draft.barberId,
        serviceId: draft.serviceId,
        date: draft.date,
        time: draft.time,
        notes: draft.notes,
      }),
    }),

  updateBookingStatus: (id: string, status: BookingStatus) =>
    request<Booking>(`/bookings/${encodeURIComponent(id)}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}
