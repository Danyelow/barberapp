export type Role = 'cliente' | 'barbero'

export type Gender = 'mujer' | 'hombre' | 'no_binario' | 'prefiero_no_decir'

export type User = {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  /**
   * Género autodeclarado en el registro. Es opcional para no romper sesiones
   * antiguas guardadas en localStorage; sin él, los servicios de barba
   * (solo para hombres) no están disponibles.
   */
  gender?: Gender
  /** Solo si role === 'barbero' */
  barberId?: string
  barbershopId?: string
}

export type StoredUser = User & { password: string }

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
}

export type BookingDraft = Omit<Booking, 'id' | 'status' | 'createdAt'>
