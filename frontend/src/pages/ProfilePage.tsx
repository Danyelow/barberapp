import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarCheck2,
  Camera,
  ChevronRight,
  CircleHelp,
  Laptop,
  Loader2,
  LocateFixed,
  LogOut,
  MapPin,
  Monitor,
  Moon,
  Scissors,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Sun,
  Trash2,
} from 'lucide-react'
import { api } from '../api/api'
import { useAuth } from '../auth/AuthContext'
import { useBookings } from '../store/BookingsContext'
import { PageHeader } from '../components/AppShell'
import { RecommendationCard } from '../components/RecommendationCard'
import { useViewMode } from '../layout/ViewModeContext'
import { useProfilePreferences } from '../profile/ProfilePreferencesContext'
import { useTheme } from '../theme/ThemeContext'
import type { Barbershop } from '../data/barbershops'
import { fileToProfilePhoto } from '../lib/image'
import { preferredServiceOptions, recommendShops } from '../lib/recommendations'
import { USER_LOCATION } from '../lib/geo'
import { useUserLocation } from '../lib/useUserLocation'
import { toISODate } from '../lib/date'
import { Avatar, Badge, Button, SelectField, Sheet, Skeleton, Switch } from '../components/ui'
import { InstallButton } from '../pwa/InstallPrompt'
import { useToast } from '../ui/ToastContext'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { bookings } = useBookings()
  const { preference, isDesktop, setPreference } = useViewMode()
  const { preference: themePreference, resolvedTheme, setPreference: setThemePreference } = useTheme()
  const { photo, preferredService, setPhoto, setPreferredService } = useProfilePreferences()
  const { coords, status, request } = useUserLocation({ requestOnMount: true })
  const { toast } = useToast()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState(true)
  const [reminders, setReminders] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [shops, setShops] = useState<Barbershop[]>([])
  const [shopsLoading, setShopsLoading] = useState(true)
  const [shopsError, setShopsError] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true
    void api
      .listShops()
      .then((result) => {
        if (!alive) return
        setShops(result)
        setShopsLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setShopsError(true)
        setShopsLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

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

  const serviceOptions = useMemo(() => preferredServiceOptions(shops, user), [shops, user])
  const recommendations = useMemo(
    () =>
      recommendShops({
        shops,
        user,
        preferredService,
        from: coords ?? USER_LOCATION,
      }),
    [shops, user, preferredService, coords],
  )

  const shopName = user?.barbershopName
  const isClient = user?.role === 'cliente'
  const locating = status === 'requesting'

  const handleLogout = () => {
    logout()
    setLogoutOpen(false)
    toast('Sesión cerrada. ¡Hasta pronto!', 'info')
    navigate('/')
  }

  const pickPhoto = () => photoInput.current?.click()

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setPhotoBusy(true)
    try {
      const dataUrl = await fileToProfilePhoto(file)
      if (setPhoto(dataUrl)) {
        toast('Foto de perfil actualizada.')
      } else {
        toast('No se pudo guardar la foto en este navegador.', 'error')
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'No se pudo procesar la imagen.', 'error')
    } finally {
      setPhotoBusy(false)
    }
  }

  const removePhoto = () => {
    if (setPhoto(null)) toast('Foto de perfil eliminada.', 'info')
    else toast('No se pudo eliminar la foto.', 'error')
  }

  const changePreferredService = (value: string) => {
    const next = value || null
    if (setPreferredService(next)) {
      toast(
        next ? `Servicio preferido: ${next}` : 'Servicio preferido eliminado.',
        'info',
      )
    } else {
      toast('No se pudo guardar la preferencia.', 'error')
    }
  }

  return (
    <div className="pb-28">
      <PageHeader title="Perfil" subtitle="Tu cuenta en BarberApp" />
      <input
        ref={photoInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => void handlePhotoChange(event)}
        aria-label="Elegir foto de perfil"
      />

      <div className="page-container space-y-4 px-4 pt-4">
        {user ? (
          <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-5 text-white">
            <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-brand-500/20 blur-2xl" />
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <Avatar name={user.name} src={photo} size="xl" className="ring-2 ring-white/20" />
                <button
                  type="button"
                  onClick={pickPhoto}
                  disabled={photoBusy}
                  aria-label="Cambiar foto de perfil"
                  className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-brand-500 text-ink-950 ring-2 ring-ink-900 transition hover:bg-brand-400 disabled:opacity-60"
                >
                  {photoBusy ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Camera className="size-3.5" aria-hidden />
                  )}
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-extrabold leading-tight">{user.name}</h2>
                <p className="truncate text-xs text-white/60">{user.email}</p>
                <p className="truncate text-[11px] text-white/60">{user.phone}</p>
                <Badge tone="brand" className="mt-2 bg-brand-500/20 text-brand-300">
                  {user.role === 'barbero' ? 'Barbero/a' : 'Cliente'}
                </Badge>
              </div>
            </div>

            {user.role === 'barbero' && shopName ? (
              <Link
                to="/agenda"
                className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15"
              >
                <Store className="size-4 text-brand-400" aria-hidden />
                <span className="truncate">{shopName}</span>
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

        {user ? (
          <section className="rounded-3xl bg-white p-4 ring-1 ring-ink-200/70">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">Personaliza tu perfil</p>
                <p className="text-[11px] text-ink-500">Foto y servicio preferido</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink-50/70 p-3">
              <Avatar name={user.name} src={photo} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">Foto de perfil</p>
                <p className="text-[11px] text-ink-500">
                  {photo ? 'Puedes cambiarla o quitarla cuando quieras.' : 'Añade una imagen para personalizar tu cuenta.'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" variant="secondary" loading={photoBusy} onClick={pickPhoto}>
                  <Camera className="size-3.5" aria-hidden />
                  {photo ? 'Cambiar' : 'Subir'}
                </Button>
                {photo ? (
                  <button
                    type="button"
                    onClick={removePhoto}
                    aria-label="Quitar foto de perfil"
                    title="Quitar foto"
                    className="grid size-9 place-items-center rounded-xl text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>

            {isClient ? (
              <div className="mt-4">
                <SelectField
                  label="Servicio preferido"
                  name="preferred-service"
                  value={preferredService ?? ''}
                  onChange={(event) => changePreferredService(event.target.value)}
                  disabled={shopsLoading}
                  hint={
                    shopsLoading
                      ? 'Cargando servicios…'
                      : 'Lo usamos para ordenar las recomendaciones cercanas según tu estilo.'
                  }
                >
                  <option value="">Cualquier servicio</option>
                  {serviceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
              </div>
            ) : null}

            <p className="mt-3 text-[10px] leading-relaxed text-ink-400">
              La foto y el servicio preferido se guardan solo en este navegador, sin enviarlos al
              servidor.
            </p>
          </section>
        ) : null}

        {user && isClient ? (
          <section className="rounded-3xl bg-white p-4 ring-1 ring-ink-200/70">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-700">
                <MapPin className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">Recomendaciones cerca de ti</p>
                <p className="text-[11px] text-ink-500">
                  {preferredService
                    ? `Según tu preferencia: ${preferredService}`
                    : 'Peluquerías cercanas para descubrir tu próximo look'}
                </p>
              </div>
              <button
                type="button"
                onClick={request}
                disabled={locating}
                aria-label="Actualizar mi ubicación"
                title="Actualizar mi ubicación"
                className="inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-semibold text-ink-600 transition hover:bg-ink-100 disabled:cursor-wait disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <LocateFixed className="size-3.5" aria-hidden />
                )}
                {coords ? 'Actualizar' : 'Ubicación'}
              </button>
            </div>

            {!preferredService ? (
              <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-[11px] leading-relaxed text-brand-800 ring-1 ring-brand-200">
                Elige un servicio preferido arriba para que las recomendaciones se ajusten mejor a
                lo que buscas.
              </p>
            ) : null}

            {shopsLoading ? (
              <div className="mt-3 space-y-2">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-[88px]" />
                ))}
              </div>
            ) : shopsError ? (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
                No se pudieron cargar las peluquerías. Inténtalo de nuevo en unos minutos.
              </p>
            ) : recommendations.length ? (
              <div className="mt-3 space-y-2">
                {recommendations.map((recommendation) => (
                  <RecommendationCard key={recommendation.shop.id} recommendation={recommendation} />
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-xs text-ink-600">
                {preferredService
                  ? 'No encontramos peluquerías con ese servicio. Prueba con otra preferencia.'
                  : 'No hay recomendaciones disponibles ahora mismo.'}
              </p>
            )}

            <p className="mt-2 text-[10px] leading-relaxed text-ink-400">
              {coords
                ? 'Distancias calculadas desde tu ubicación actual.'
                : 'Usando el centro de Sevilla; activa tu ubicación para ajustar las distancias.'}
            </p>
          </section>
        ) : null}

        <section className="rounded-3xl bg-white p-4 ring-1 ring-ink-200/70">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
              {resolvedTheme === 'dark' ? (
                <Moon className="size-4" aria-hidden />
              ) : (
                <Sun className="size-4" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900">Tema de la app</p>
              <p className="text-[11px] text-ink-500">
                Ahora ves el tema {resolvedTheme === 'dark' ? 'oscuro' : 'claro'}
              </p>
            </div>
            <Badge tone="brand">
              {themePreference === 'system' ? 'Auto' : resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-ink-100 p-1">
            {(
              [
                { value: 'system', label: 'Auto', icon: Monitor },
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'dark', label: 'Oscuro', icon: Moon },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setThemePreference(item.value)}
                aria-pressed={themePreference === item.value}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold transition ${
                  themePreference === item.value
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                <item.icon className="size-3.5" aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
            Auto sigue el tema claro u oscuro de tu dispositivo. El cambio se guarda en este navegador.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-4 ring-1 ring-ink-200/70">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
              <Monitor className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900">Formato de pantalla</p>
              <p className="text-[11px] text-ink-500">
                {isDesktop ? 'Ahora ves la vista PC' : 'Ahora ves la vista móvil'}
              </p>
            </div>
            <Badge tone="brand">{isDesktop ? 'PC' : 'Móvil'}</Badge>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-ink-100 p-1">
            {(
              [
                { value: 'auto', label: 'Auto', icon: Monitor },
                { value: 'desktop', label: 'PC', icon: Laptop },
                { value: 'mobile', label: 'Móvil', icon: Smartphone },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPreference(item.value)}
                aria-pressed={preference === item.value}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-xl text-[12px] font-semibold transition ${
                  preference === item.value
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                <item.icon className="size-3.5" aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
            Automática usa la vista PC en pantallas grandes y la móvil en el teléfono. La vista PC
            necesita una ventana de al menos 768 px. El cambio se guarda en este navegador.
          </p>
        </section>

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
                <p className="text-[11px] text-ink-500">Añádela al escritorio o pantalla de inicio</p>
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
              toast('Tus citas y tu cuenta se guardan en el servidor de BarberApp.', 'info')
            }
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-ink-50"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-ink-100 text-ink-700">
              <ShieldCheck className="size-4" aria-hidden />
            </span>
            <span className="flex-1 text-sm font-semibold text-ink-900">Privacidad y datos</span>
            <ChevronRight className="size-4 text-ink-400" aria-hidden />
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
            Proyecto de demostración (PWA). Datos ficticios en Django + SpatiaLite.
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
