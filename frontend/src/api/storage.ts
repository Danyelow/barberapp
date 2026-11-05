import { barbershops } from '../data/barbershops'
import { toISODate } from '../lib/date'
import type { Booking, StoredUser } from '../types'

export const KEYS = {
  users: 'barberapp.users.v1',
  session: 'barberapp.session.v1',
  bookings: 'barberapp.bookings.v1',
} as const

export const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const write = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* almacenamiento no disponible (modo privado): la demo sigue funcionando en memoria */
  }
}

const dayFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

const seedUsers = (): StoredUser[] => [
  {
    id: 'u-cliente',
    name: 'Lucía Gómez',
    email: 'cliente@barberapp.dev',
    phone: '+34 600 111 222',
    role: 'cliente',
    gender: 'mujer',
    password: '123456',
  },
  {
    id: 'u-barbero',
    name: 'Mateo Ruiz',
    email: 'barbero@barberapp.dev',
    phone: '+34 600 333 444',
    role: 'barbero',
    gender: 'hombre',
    barberId: 'mateo',
    barbershopId: 'el-clasico',
    password: '123456',
  },
]

const seedBookings = (): Booking[] => [
  {
    id: 'b-seed-1',
    userId: 'u-cliente',
    customerName: 'Lucía Gómez',
    customerPhone: '+34 600 111 222',
    barbershopId: 'el-clasico',
    barberId: 'mateo',
    serviceId: 'fade',
    date: dayFromNow(1),
    time: '17:00',
    durationMin: 45,
    price: 25,
    status: 'confirmada',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-seed-2',
    userId: 'u-cliente',
    customerName: 'Lucía Gómez',
    customerPhone: '+34 600 111 222',
    barbershopId: 'nordic-fade',
    barberId: 'lukas',
    serviceId: 'signature',
    date: dayFromNow(4),
    time: '12:00',
    durationMin: 45,
    price: 28,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-seed-3',
    userId: 'u-cliente',
    customerName: 'Lucía Gómez',
    customerPhone: '+34 600 111 222',
    barbershopId: 'la-navaja',
    barberId: 'paco',
    serviceId: 'completo',
    date: dayFromNow(-9),
    time: '11:30',
    durationMin: 60,
    price: 35,
    status: 'completada',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-seed-4',
    userId: 'u-cliente',
    customerName: 'Lucía Gómez',
    customerPhone: '+34 600 111 222',
    barbershopId: 'el-clasico',
    barberId: 'mateo',
    serviceId: 'corte',
    date: dayFromNow(-20),
    time: '18:30',
    durationMin: 30,
    price: 18,
    status: 'cancelada',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b-seed-5',
    userId: 'u-cliente',
    customerName: 'Lucía Gómez',
    customerPhone: '+34 600 111 222',
    barbershopId: 'el-clasico',
    barberId: 'mateo',
    serviceId: 'corte',
    date: dayFromNow(2),
    time: '19:00',
    durationMin: 30,
    price: 18,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  },
]

export const ensureSeedData = () => {
  if (!read<StoredUser[] | null>(KEYS.users, null)) write(KEYS.users, seedUsers())
  if (!read<Booking[] | null>(KEYS.bookings, null)) write(KEYS.bookings, seedBookings())

  // Sesiones antiguas: completa el género de las cuentas demo si faltaba.
  const users = read<StoredUser[]>(KEYS.users, [])
  let migrated = false
  const nextUsers = users.map((user) => {
    if (user.gender) return user
    if (user.id === 'u-cliente') {
      migrated = true
      return { ...user, gender: 'mujer' as const }
    }
    if (user.id === 'u-barbero') {
      migrated = true
      return { ...user, gender: 'hombre' as const }
    }
    return user
  })
  if (migrated) write(KEYS.users, nextUsers)

  // Los datos de demo han pasado de Madrid a Sevilla. Las reservas antiguas
  // conservan sus IDs, pero si apuntan a un servicio retirado o a un servicio
  // de barba reservado por una clienta, se reasignan a un servicio válido.
  const storedBookings = read<Booking[]>(KEYS.bookings, [])
  let bookingsMigrated = false
  const bookings = storedBookings.map((booking) => {
    const shop = barbershops.find((item) => item.id === booking.barbershopId)
    if (!shop) return booking

    const service = shop.services.find((item) => item.id === booking.serviceId)
    const user = nextUsers.find((item) => item.id === booking.userId)
    const unavailable = !service || (service.onlyForMen && user?.gender !== 'hombre')
    if (!unavailable) return booking

    const fallback = shop.services.find((item) => !item.onlyForMen)
    if (!fallback) return booking

    bookingsMigrated = true
    return {
      ...booking,
      serviceId: fallback.id,
      price: fallback.price,
      durationMin: fallback.durationMin,
    }
  })
  if (bookingsMigrated) write(KEYS.bookings, bookings)

  // Mantiene la agenda del barbero demo con contenido aunque pasen los días.
  const hasUpcomingBarberBooking = bookings.some(
    (booking) =>
      booking.barberId === 'mateo' &&
      booking.date >= toISODate(new Date()) &&
      booking.status !== 'cancelada',
  )

  if (!hasUpcomingBarberBooking) {
    const shop = barbershops[0]
    const service = shop.services.find((item) => !item.onlyForMen) ?? shop.services[0]
    const newBooking: Booking = {
      id: `b-seed-${Date.now()}`,
      userId: 'u-cliente',
      customerName: 'Lucía Gómez',
      customerPhone: '+34 600 111 222',
      barbershopId: shop.id,
      barberId: 'mateo',
      serviceId: service.id,
      date: dayFromNow(1),
      time: '10:30',
      durationMin: service.durationMin,
      price: service.price,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    }
    write(KEYS.bookings, [...bookings, newBooking])
  }
}
