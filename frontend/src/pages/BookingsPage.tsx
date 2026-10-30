import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CalendarDays, History, Scissors } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useBookings } from '../store/BookingsContext'
import { BookingCard } from '../components/BookingCard'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState, Sheet, Button } from '../components/ui'
import { PageHeader } from '../components/AppShell'
import { useToast } from '../ui/ToastContext'
import { formatLongDate, toISODate } from '../lib/date'
import type { Booking } from '../types'
import { cn } from '../lib/cn'

type Tab = 'proximas' | 'historial'

export function BookingsPage() {
  const { user } = useAuth()
  const { bookings, cancelBooking } = useBookings()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('proximas')
  const [target, setTarget] = useState<Booking | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const today = toISODate(new Date())
  const mine = useMemo(
    () => bookings.filter((booking) => booking.userId === user?.id),
    [bookings, user?.id],
  )

  const upcoming = useMemo(
    () =>
      mine
        .filter(
          (booking) =>
            (booking.status === 'pendiente' || booking.status === 'confirmada') && booking.date >= today,
        )
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [mine, today],
  )

  const history = useMemo(
    () =>
      mine
        .filter(
          (booking) =>
            booking.status === 'completada' ||
            booking.status === 'cancelada' ||
            ((booking.status === 'pendiente' || booking.status === 'confirmada') && booking.date < today),
        )
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [mine, today],
  )

  const list = tab === 'proximas' ? upcoming : history

  if (user?.role === 'barbero') {
    return <Navigate to="/agenda" replace />
  }

  const handleCancel = async () => {
    if (!target) return
    setBusyId(target.id)
    try {
      await cancelBooking(target.id)
      toast('Cita cancelada. Te esperamos en otra ocasión.')
      setTarget(null)
    } catch {
      toast('No se pudo cancelar la cita', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="pb-28">
      <PageHeader
        title="Mis citas"
        subtitle={
          upcoming.length
            ? `${upcoming.length} ${upcoming.length === 1 ? 'cita próxima' : 'citas próximas'}`
            : 'Gestiona tus reservas'
        }
        action={
          <Link
            to="/"
            aria-label="Reservar otra cita"
            className="grid size-9 place-items-center rounded-full bg-ink-900 text-white transition hover:bg-ink-800"
          >
            <Scissors className="size-4" aria-hidden />
          </Link>
        }
      />

      <div className="space-y-4 px-4 pt-4">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-ink-100 p-1">
          {(
            [
              { key: 'proximas', label: 'Próximas', icon: CalendarDays, count: upcoming.length },
              { key: 'historial', label: 'Historial', icon: History, count: history.length },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                'flex h-10 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold transition',
                tab === item.key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700',
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  tab === item.key ? 'bg-ink-900 text-brand-400' : 'bg-ink-200 text-ink-600',
                )}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {list.length ? (
          <div className="space-y-3">
            {list.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                busy={busyId === booking.id}
                onCancel={setTarget}
              />
            ))}
          </div>
        ) : tab === 'proximas' ? (
          <EmptyState
            icon={<CalendarDays className="size-5" />}
            title="Sin citas próximas"
            message="Encuentra tu barbería y reserva en menos de un minuto."
            action={
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800"
              >
                <Scissors className="size-4" aria-hidden />
                Buscar barbería
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={<History className="size-5" />}
            title="Todavía no hay historial"
            message="Aquí verás tus citas completadas y canceladas."
          />
        )}
      </div>

      <Sheet
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="¿Cancelar esta cita?"
        description={
          target
            ? `${formatLongDate(target.date)} a las ${target.time} h. Esta acción no se puede deshacer.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" full onClick={() => setTarget(null)}>
              Mantener cita
            </Button>
            <Button variant="danger" full loading={Boolean(busyId)} onClick={() => void handleCancel()}>
              Sí, cancelar
            </Button>
          </>
        }
      >
        {target ? (
          <div className="flex items-center justify-between rounded-2xl bg-ink-50 p-3">
            <span className="text-sm font-semibold text-ink-800">Estado actual</span>
            <StatusBadge status={target.status} />
          </div>
        ) : null}
      </Sheet>
    </div>
  )
}
