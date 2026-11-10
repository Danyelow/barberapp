import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api/api'
import { useAuth } from '../auth/AuthContext'
import type { Booking, BookingDraft, BookingStatus } from '../types'

type BookingsContextValue = {
  bookings: Booking[]
  loading: boolean
  refresh: () => Promise<void>
  createBooking: (draft: BookingDraft) => Promise<Booking>
  cancelBooking: (id: string) => Promise<void>
  updateStatus: (id: string, status: BookingStatus) => Promise<void>
}

const BookingsContext = createContext<BookingsContextValue | null>(null)

export function BookingsProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const result = await api.bookings()
      setBookings(result)
    } catch {
      // La sesión o el backend pueden fallar: no dejamos la app bloqueada.
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!user) {
      setBookings([])
      setLoading(false)
      return
    }
    setLoading(true)
    void refresh()
  }, [ready, user?.id, refresh])

  const createBooking = useCallback(async (draft: BookingDraft) => {
    const created = await api.createBooking(draft)
    setBookings((current) => [created, ...current])
    return created
  }, [])

  const cancelBooking = useCallback(async (id: string) => {
    const updated = await api.updateBookingStatus(id, 'cancelada')
    setBookings((current) => current.map((booking) => (booking.id === id ? updated : booking)))
  }, [])

  const updateStatus = useCallback(async (id: string, status: BookingStatus) => {
    const updated = await api.updateBookingStatus(id, status)
    setBookings((current) => current.map((booking) => (booking.id === id ? updated : booking)))
  }, [])

  const value = useMemo(
    () => ({ bookings, loading, refresh, createBooking, cancelBooking, updateStatus }),
    [bookings, loading, refresh, createBooking, cancelBooking, updateStatus],
  )

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
}

export const useBookings = () => {
  const context = useContext(BookingsContext)
  if (!context) throw new Error('useBookings debe usarse dentro de BookingsProvider')
  return context
}
