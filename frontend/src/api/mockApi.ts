import { barbershops, findBarbershop, findService } from '../data/barbershops'
import { toISODate } from '../lib/date'
import type { Booking, BookingDraft, BookingStatus, StoredUser, User } from '../types'
import { ensureSeedData, KEYS, read, write } from './storage'

const LATENCY = 260

const delay = <T,>(value: T, ms = LATENCY) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms)
  })

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const publicUser = ({ password: _password, ...user }: StoredUser): User => user

export const mockApi = {
  login: (email: string, password: string) =>
    new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        ensureSeedData()
        const users = read<StoredUser[]>(KEYS.users, [])
        const found = users.find(
          (user) => normalize(user.email) === normalize(email.trim()) && user.password === password,
        )
        if (!found) {
          reject(new Error('Email o contraseña incorrectos.'))
          return
        }
        write(KEYS.session, found.id)
        resolve(publicUser(found))
      }, LATENCY)
    }),

  register: (input: { name: string; email: string; phone: string; password: string }) =>
    new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        ensureSeedData()
        const users = read<StoredUser[]>(KEYS.users, [])
        if (users.some((user) => normalize(user.email) === normalize(input.email.trim()))) {
          reject(new Error('Ya existe una cuenta con ese email.'))
          return
        }
        const user: StoredUser = {
          id: `u-${Date.now()}`,
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          password: input.password,
          role: 'cliente',
        }
        write(KEYS.users, [...users, user])
        write(KEYS.session, user.id)
        resolve(publicUser(user))
      }, LATENCY)
    }),

  restoreSession: () => {
    ensureSeedData()
    const sessionId = read<string | null>(KEYS.session, null)
    if (!sessionId) return null
    const users = read<StoredUser[]>(KEYS.users, [])
    const found = users.find((user) => user.id === sessionId)
    return found ? publicUser(found) : null
  },

  logout: () => {
    try {
      localStorage.removeItem(KEYS.session)
    } catch {
      /* noop */
    }
  },

  listShops: (query = '') => {
    const term = normalize(query.trim())
    if (!term) return delay(barbershops)
    return delay(
      barbershops.filter((shop) => {
        const haystack = normalize(
          [shop.name, shop.city, shop.address, ...shop.tags, ...shop.services.map((service) => service.name)].join(' '),
        )
        return haystack.includes(term)
      }),
    )
  },

  getShop: (id: string) =>
    new Promise<typeof barbershops[number] | null>((resolve) => {
      setTimeout(() => resolve(findBarbershop(id) ?? null), LATENCY)
    }),

  bookings: () => delay(read<Booking[]>(KEYS.bookings, [])),

  bookedTimes: (barbershopId: string, barberId: string, isoDate: string) => {
    ensureSeedData()
    const bookings = read<Booking[]>(KEYS.bookings, [])
    return bookings
      .filter(
        (booking) =>
          booking.barbershopId === barbershopId &&
          booking.barberId === barberId &&
          booking.date === isoDate &&
          booking.status !== 'cancelada',
      )
      .map((booking) => booking.time)
  },

  createBooking: (draft: BookingDraft) =>
    new Promise<Booking>((resolve, reject) => {
      setTimeout(() => {
        const shop = findBarbershop(draft.barbershopId)
        const service = findService(draft.barbershopId, draft.serviceId)
        if (!shop || !service) {
          reject(new Error('No se ha podido preparar la reserva.'))
          return
        }
        const bookings = read<Booking[]>(KEYS.bookings, [])
        const clash = bookings.some(
          (booking) =>
            booking.barberId === draft.barberId &&
            booking.date === draft.date &&
            booking.time === draft.time &&
            booking.status !== 'cancelada',
        )
        if (clash) {
          reject(new Error('Ese hueco acaba de ocuparse. Elige otro horario.'))
          return
        }
        const booking: Booking = {
          ...draft,
          id: `b-${Date.now()}`,
          status: 'pendiente',
          createdAt: new Date().toISOString(),
        }
        write(KEYS.bookings, [booking, ...bookings])
        resolve(booking)
      }, LATENCY)
    }),

  updateBookingStatus: (id: string, status: BookingStatus) =>
    new Promise<Booking>((resolve, reject) => {
      setTimeout(() => {
        const bookings = read<Booking[]>(KEYS.bookings, [])
        const target = bookings.find((booking) => booking.id === id)
        if (!target) {
          reject(new Error('Reserva no encontrada.'))
          return
        }
        const updated: Booking = { ...target, status }
        write(
          KEYS.bookings,
          bookings.map((booking) => (booking.id === id ? updated : booking)),
        )
        resolve(updated)
      }, LATENCY)
    }),

  cancelBooking: (id: string) => mockApi.updateBookingStatus(id, 'cancelada'),

  upcomingForUser: (userId: string) => {
    const bookings = read<Booking[]>(KEYS.bookings, [])
    const today = toISODate(new Date())
    return delay(
      bookings.filter(
        (booking) =>
          booking.userId === userId &&
          booking.date >= today &&
          (booking.status === 'pendiente' || booking.status === 'confirmada'),
      ),
    )
  },
}
