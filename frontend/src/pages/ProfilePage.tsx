import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarCheck2,
  ChevronRight,
  CircleHelp,
  Database,
  LogOut,
  Scissors,
  ShieldCheck,
  Smartphone,
  Store,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useBookings } from '../store/BookingsContext'
import { PageHeader } from '../components/AppShell'
import { Avatar, Badge, Button, Sheet, Switch } from '../components/ui'
import { InstallButton } from '../pwa/InstallPrompt'
import { useToast } from '../ui/ToastContext'
import { findBarbershop } from '../data/barbershops'
import { toISODate } from '../lib/date'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { bookings } = useBookings()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState(true)
  const [reminders, setReminders] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const today = toISODate(new Date())
  const stats = useMemo(() => {
    if (!user) return { total: 0, upcoming: 0 }
    if (user.role === 'barbero') {
      const mine = bookings.filter((booking) => booking.barberId === user.barberId)
      return {
        total: mine.filter((booking) => booking.date === today).length,
        upcoming: mine.filter(
          (booking) =>
            booking.date > today && (booking.status === 'pendiente' || booking.status === 'confirmada'),
        ).length,
      }
    }
    const mine = bookings.filter((booking) => booking.userId === user.id)
    return {
      total: mine.length,
      upcoming: mine.filter(
        (booking) =>
          booking.date >= today && (booking.status === 'pendiente' || booking.status === 'confirmada'),
      ).length,
    }
  }, [bookings, user, today])

  const shop = user?.barbershopId ? findBarbershop(user.barbershopId) : undefined

  const handleLogout = () => {
    logout()
    setLogoutOpen(false)
    toast('Sesión cerrada. ¡Hasta pronto!', 'info')
    navigate('/')
  }

  return (
    <div className="pb-28">
      <PageHeader title="Perfil" subtitle="Tu cuenta en BarberApp" />

      <div className="space-y-4 px-4 pt-4">
        {user ? (
          <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-5 text-white">
            <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-brand-500/20 blur-2xl" />
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="xl" className="ring-2 ring-white/20" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-extrabold leading-tight">{user.name}</h2>
                <p className="truncate text-xs text-white/60">{user.email}</p>
                <p className="truncate text-[11px] text-white/60">{user.phone}</p>
                <Badge tone="brand" className="mt-2 bg-brand-500/20 text-brand-300">
                  {user.role === 'barbero' ? 'Barbero' : 'Cliente'}
                </Badge>
              </div>
            </div>

            {user.role === 'barbero' && shop ? (
              <Link
                to="/agenda"
                className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15"
              >
                <Store className="size-4 text-brand-400" aria-hidden />
                <span className="truncate">{shop.name}</span>
                <ChevronRight className="ml-auto size-4 text-white/40" aria-hidden />
              </Link>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                <p className="text-2xl font-extrabold leading-none">{stats.total}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
                  {user.role === 'barbero' ? 'Citas hoy' : 'Reservas totales'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                <p className="text-2xl font-extrabold leading-none text-brand-400">{stats.upcoming}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
                  Próximas citas
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl bg-white p-5 text-center ring-1 ring-ink-200/70">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink-900 text-brand-500">
              <Scissors className="size-6" aria-hidden />
            </span>
            <h2 className="mt-3 text-lg font-extrabold text-ink-900">Entra en tu cuenta</h2>
            <p className="mx-auto mt-1 max-w-xs text-sm text-ink-500">
              Guarda tus citas, cancela cuando quieras y reserva más rápido.
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/entrar" className="flex-1">
                <Button full>Entrar</Button>
              </Link>
              <Link to="/registro" className="flex-1">
                <Button variant="secondary" full>
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200/70">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
                <Bell className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Notificaciones</p>
                <p className="text-[11px] text-ink-500">Avisos de cambios en tus citas</p>
              </div>
            </div>
            <Switch checked={notifications} onChange={setNotifications} label="Notificaciones" />
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
                <CalendarCheck2 className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Recordatorios</p>
                <p className="text-[11px] text-ink-500">24 h antes de cada cita</p>
              </div>
            </div>
            <Switch checked={reminders} onChange={setReminders} label="Recordatorios" />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
                <Smartphone className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">App instalable</p>
                <p className="text-[11px] text-ink-500">Añádela a tu pantalla de inicio</p>
              </div>
            </div>
            <InstallButton />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200/70">
          <button
            type="button"
            onClick={() => toast('Documentación y soporte: próximamente.', 'info')}
            className="flex w-full items-center gap-3 border-b border-ink-100 px-4 py-3.5 text-left transition hover:bg-ink-50"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
              <CircleHelp className="size-4" aria-hidden />
            </span>
            <span className="flex-1 text-sm font-semibold text-ink-900">Ayuda y contacto</span>
            <ChevronRight className="size-4 text-ink-400" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() =>
              toast('Tus datos de demo se guardan solo en este navegador (localStorage).', 'info')
            }
            className="flex w-full items-center gap-3 border-b border-ink-100 px-4 py-3.5 text-left transition hover:bg-ink-50"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
              <ShieldCheck className="size-4" aria-hidden />
            </span>
            <span className="flex-1 text-sm font-semibold text-ink-900">Privacidad y datos</span>
            <ChevronRight className="size-4 text-ink-400" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('barberapp.bookings.v1')
              toast('Reservas de demo restablecidas al recargar', 'info')
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-ink-50"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
              <Database className="size-4" aria-hidden />
            </span>
            <span className="flex-1 text-sm font-semibold text-ink-900">Restablecer datos de demo</span>
            <Trash2 className="size-4 text-ink-400" aria-hidden />
          </button>
        </section>

        {user ? (
          <Button
            variant="secondary"
            full
            size="lg"
            className="text-red-600 ring-red-200 hover:bg-red-50"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </Button>
        ) : null}

        <div className="space-y-1.5 pb-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            BarberApp · v0.1.0
          </p>
          <p className="text-[10px] leading-relaxed text-ink-400">
            Proyecto de demostración (PWA). Frontend con datos ficticios locales.
          </p>
        </div>
      </div>

      <Sheet
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="¿Cerrar sesión?"
        description="Podrás volver a entrar cuando quieras con tu email."
        footer={
          <>
            <Button variant="secondary" full onClick={() => setLogoutOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" full onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </>
        }
      />
    </div>
  )
}
