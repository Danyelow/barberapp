import { Link } from 'react-router-dom'
import { CalendarPlus, Phone, RotateCcw, X } from 'lucide-react'
import { findBarber, findBarbershop, findService } from '../data/barbershops'
import { formatLongDate, formatPrice } from '../lib/date'
import type { Booking, BookingStatus } from '../types'
import { StatusBadge } from './StatusBadge'
import { Avatar, Button } from './ui'

type BookingCardProps = {
  booking: Booking
  role?: 'cliente' | 'barbero'
  busy?: boolean
  onCancel?: (booking: Booking) => void
  onStatus?: (booking: Booking, status: BookingStatus) => void
}

export function BookingCard({ booking, role = 'cliente', busy = false, onCancel, onStatus }: BookingCardProps) {
  const shop = findBarbershop(booking.barbershopId)
  const service = findService(booking.barbershopId, booking.serviceId)
  const barber = findBarber(booking.barbershopId, booking.barberId)

  if (!shop || !service || !barber) return null

  const [year, month, day] = booking.date.split('-')
  const monthLabel = new Intl.DateTimeFormat('es-ES', { month: 'short' })
    .format(new Date(Number(year), Number(month) - 1, Number(day)))
    .replace('.', '')
  const isUpcoming = booking.status === 'pendiente' || booking.status === 'confirmada'
  const isBarber = role === 'barbero'

  return (
    <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200/70">
      <div className="flex gap-3 p-4">
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-ink-900 py-2 text-white">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/55">{monthLabel}</span>
          <span className="text-2xl font-bold leading-none">{day}</span>
          <span className="mt-1 text-[11px] font-semibold text-brand-400">{booking.time}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold text-ink-900">
                {isBarber ? booking.customerName : shop.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-ink-500">
                {service.name} · {service.durationMin} min
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <Avatar name={isBarber ? booking.customerName : barber.name} size="sm" />
            <div className="min-w-0 text-xs text-ink-600">
              {isBarber ? (
                <a
                  href={`tel:${booking.customerPhone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1 font-medium text-ink-800 hover:underline"
                >
                  <Phone className="size-3" aria-hidden />
                  {booking.customerPhone}
                </a>
              ) : (
                <p className="truncate">
                  Con <span className="font-semibold text-ink-800">{barber.name}</span>
                </p>
              )}
              <p className="truncate text-ink-500">{formatLongDate(booking.date)}</p>
            </div>
            <span className="ml-auto shrink-0 text-sm font-bold text-ink-900">{formatPrice(booking.price)}</span>
          </div>
        </div>
      </div>

      {booking.notes ? (
        <p className="mx-4 mb-3 rounded-xl bg-ink-50 px-3 py-2 text-xs text-ink-600">{booking.notes}</p>
      ) : null}

      <div className="flex items-center gap-2 border-t border-ink-100 bg-ink-50/60 px-4 py-2.5">
        {isBarber ? (
          <>
            {booking.status === 'pendiente' ? (
              <Button size="sm" variant="primary" disabled={busy} onClick={() => onStatus?.(booking, 'confirmada')}>
                Confirmar
              </Button>
            ) : null}
            {booking.status === 'confirmada' ? (
              <Button size="sm" variant="primary" disabled={busy} onClick={() => onStatus?.(booking, 'completada')}>
                Marcar completada
              </Button>
            ) : null}
            {isUpcoming ? (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => onCancel?.(booking)}>
                <X className="size-3.5" aria-hidden />
                Cancelar
              </Button>
            ) : (
              <span className="text-[11px] text-ink-500">
                {booking.status === 'completada' ? 'Servicio realizado' : 'Reserva cancelada'}
              </span>
            )}
          </>
        ) : (
          <>
            {isUpcoming ? (
              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={busy} onClick={() => onCancel?.(booking)}>
                <X className="size-3.5" aria-hidden />
                Cancelar cita
              </Button>
            ) : (
              <Link
                to={`/barberia/${shop.id}/reservar?servicio=${service.id}&barbero=${barber.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-800 transition hover:bg-ink-100"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reservar otra vez
              </Link>
            )}
            <Link
              to={`/barberia/${shop.id}`}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-100"
            >
              <CalendarPlus className="size-3.5" aria-hidden />
              Ver barbería
            </Link>
          </>
        )}
      </div>
    </article>
  )
}
