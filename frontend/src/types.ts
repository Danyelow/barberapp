export type Role = 'cliente' | 'barbero'

export type Gender = 'mujer' | 'hombre' | 'no_binario' | 'prefiero_no_decir'

export type User = {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  /**
   * Género autodeclarado en el registro. Sin él, los servicios de barba
   * (solo para hombres) no están disponibles.
   */
  gender?: Gender
  /** Solo si role === 'barbero' */
  barberId?: string
  barbershopId?: string
  barbershopName?: string
  speciality?: string
  rating?: number
  years?: number
}

export type BookingStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'

export type Booking = {
  id: string
  userId: string
  customerName: string
  customerPhone: string
  barbershopId: string
  barberId: string
  serviceId: string
  date: string
  time: string
  durationMin: number
  price: number
  status: BookingStatus
  notes?: string
  createdAt: string
  /** Datos visibles que devuelve la API para no depender del catálogo local. */
  barbershopName?: string
  barbershopCover?: string
  barberName?: string
  serviceName?: string
  serviceDurationMin?: number
}

export type BookingDraft = Omit<Booking, 'id' | 'status' | 'createdAt'>
