import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CalendarClock, CheckCircle2, History, Scissors, TrendingUp } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useBookings } from '../store/BookingsContext'
import { BookingCard } from '../components/BookingCard'
import { PageHeader } from '../components/AppShell'
import { Avatar, Badge, Button, EmptyState, Sheet } from '../components/ui'
import { useToast } from '../ui/ToastContext'
import { findBarbershop } from '../data/barbershops'
import { formatPrice, toISODate } from '../lib/date'
import { cn } from '../lib/cn'
import type { Booking, BookingStatus } from '../types'

type Tab = 'hoy' | 'proximas' | 'historial'

export function AgendaPage() {
  const { user } = useAuth()
  const { bookings, updateStatus, cancelBooking } = useBookings()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('hoy')
  const [target, setTarget] = useState<Booking | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const today = toISODate(new Date())
  const shop = user?.barbershopId ? findBarbershop(user.barbershopId) : undefined
  const barber = shop?.barbers.find((item) => item.id === user?.barberId)

  const mine = useMemo(
    () => bookings.filter((booking) => booking.barberId === user?.barberId),
    [bookings, user?.barberId],
  )

  const todayList = useMemo(
    () =>
      mine
        .filter((booking) => booking.date === today && booking.status !== 'cancelada')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [mine, today],
  )

  const upcomingList = useMemo(
    () =>
      mine
        .filter(
          (booking) =>
            booking.date > today && (booking.status === 'pendiente' || booking.status === 'confirmada'),
        )
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [mine, today],
  )

  const historyList = useMemo(
    () =>
      mine
        .filter(
          (booking) =>
            booking.date < today || booking.status === 'completada' || booking.status === 'cancelada',
        )
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [mine, today],
  )

  const pending = mine.filter((booking) => booking.status === 'pendiente').length
  const revenue = mine
    .filter((booking) => booking.status === 'completada')
    .reduce((total, booking) => total + booking.price, 0)

  if (user && user.role !== 'barbero') {
    return <Navigate to="/citas" replace />
  }

  if (!shop || !barber) {
    return (
      <div className="pb-28">
        <PageHeader title="Agenda" subtitle="Panel del barbero" />
        <div className="px-4 pt-4">
          <EmptyState
            icon={<Scissors className="size-5" />}
            title="Cuenta sin barbería asignada"
            message="Esta cuenta no está vinculada a ninguna barbería. Contacta con el administrador."
            action={
              <Link to="/" className="text-sm font-semibold text-brand-700 underline underline-offset-4">
                Volver al inicio
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const lists: Record<Tab, Booking[]> = {
    hoy: todayList,
    proximas: upcomingList,
    historial: historyList,
  }

  const handleStatus = async (booking: Booking, status: BookingStatus) => {
    setBusyId(booking.id)
    try {
      await updateStatus(booking.id, status)
      toast(status === 'confirmada' ? 'Cita confirmada' : 'Cita marcada como completada')
    } catch {
      toast('No se pudo actualizar la cita', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleCancel = async () => {
    if (!target) return
    setBusyId(target.id)
    try {
      await cancelBooking(target.id)
      toast('Cita cancelada')
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
        title="Agenda"
        subtitle={shop.name}
        action={
          <Badge tone="brand">
            <span className="size-1.5 rounded-full bg-current animate-dot" aria-hidden />
            Barbero
          </Badge>
        }
      />

      <div className="space-y-4 px-4 pt-4">
        <section className="flex items-center gap-3 rounded-3xl bg-ink-900 p-4 text-white">
          <Avatar name={barber.name} size="lg" className="ring-2 ring-white/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold">{barber.name}</p>
            <p className="truncate text-xs text-white/60">
              {barber.specialty} · ★ {barber.rating.toFixed(1)}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-brand-400">{shop.name}</p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          {[
            { label: 'Hoy', value: `${todayList.length}`, icon: CalendarClock },
            { label: 'Pendientes', value: `${pending}`, icon: CheckCircle2 },
            { label: 'Ingresos', value: formatPrice(revenue), icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-3 ring-1 ring-ink-200/70">
              <stat.icon className="size-4 text-brand-600" aria-hidden />
              <p className="mt-2 text-lg font-extrabold leading-none text-ink-900">{stat.value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-ink-100 p-1">
          {(
            [
              { key: 'hoy', label: 'Hoy', icon: CalendarClock, count: todayList.length },
              { key: 'proximas', label: 'Próximas', icon: CheckCircle2, count: upcomingList.length },
              { key: 'historial', label: 'Historial', icon: History, count: historyList.length },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                'flex h-10 items-center justify-center gap-1 rounded-xl text-[12px] font-semibold transition',
                tab === item.key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700',
              )}
            >
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

        {lists[tab].length ? (
          <div className="space-y-3">
            {lists[tab].map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role="barbero"
                busy={busyId === booking.id}
                onCancel={setTarget}
                onStatus={(item, status) => void handleStatus(item, status)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarClock className="size-5" />}
            title={tab === 'hoy' ? 'Sin citas para hoy' : 'Nada por aquí'}
            message={
              tab === 'hoy'
                ? 'No tienes reservas para hoy. Aprovecha para ordenar la barbería.'
                : 'Cuando haya citas en este periodo aparecerán aquí.'
            }
          />
        )}
      </div>

      <Sheet
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="¿Cancelar la cita del cliente?"
        description={
          target
            ? `${target.customerName} · ${target.date.split('-').reverse().join('/')} a las ${target.time} h.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" full onClick={() => setTarget(null)}>
              Volver
            </Button>
            <Button variant="danger" full loading={Boolean(busyId)} onClick={() => void handleCancel()}>
              Cancelar cita
            </Button>
          </>
        }
      />
    </div>
  )
}
