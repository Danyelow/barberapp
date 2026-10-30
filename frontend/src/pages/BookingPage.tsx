import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Info,
  PartyPopper,
  Scissors,
  Star,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useBookings } from '../store/BookingsContext'
import { useToast } from '../ui/ToastContext'
import { findBarbershop, findService } from '../data/barbershops'
import { getSlots } from '../lib/availability'
import {
  durationLabel,
  formatPrice,
  nextDays,
  parseISODate,
  relativeDayLabel,
  toISODate,
} from '../lib/date'
import { Avatar, Button, Cover, EmptyState } from '../components/ui'
import { cn } from '../lib/cn'
import type { Booking } from '../types'

const steps = ['Servicio', 'Barbero', 'Horario', 'Confirmar'] as const

export function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { bookings, createBooking } = useBookings()
  const { toast } = useToast()

  const shop = id ? findBarbershop(id) : undefined
  const [step, setStep] = useState(() => {
    if (!params.get('servicio')) return 0
    return params.get('barbero') ? 2 : 1
  })
  const [serviceId, setServiceId] = useState(params.get('servicio') ?? '')
  const [barberId, setBarberId] = useState(params.get('barbero') ?? '')
  const [date, setDate] = useState(() => toISODate(new Date()))
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<Booking | null>(null)

  const service = shop && serviceId ? findService(shop.id, serviceId) : undefined
  const barber = shop && barberId ? shop.barbers.find((item) => item.id === barberId) : undefined
  const days = useMemo(() => nextDays(14), [])

  useEffect(() => {
    setTime('')
  }, [barberId, serviceId, date])

  const slots = useMemo(() => {
    if (!shop || !service || !barberId) return []
    const takenTimes = bookings
      .filter(
        (booking) =>
          booking.barbershopId === shop.id &&
          booking.barberId === barberId &&
          booking.date === date &&
          booking.status !== 'cancelada',
      )
      .map((booking) => booking.time)
    return getSlots({
      shop,
      barberId,
      date: parseISODate(date),
      durationMin: service.durationMin,
      takenTimes,
    })
  }, [shop, service, barberId, date, bookings])

  if (!shop) {
    return (
      <div className="mx-auto min-h-dvh max-w-md bg-stone-50 px-4 py-16">
        <EmptyState
          icon={<Scissors className="size-5" />}
          title="Barbería no encontrada"
          message="No pudimos cargar esta barbería. Vuelve al inicio y elige otra."
          action={
            <Link to="/" className="text-sm font-semibold text-brand-700 underline underline-offset-4">
              Volver al inicio
            </Link>
          }
        />
      </div>
    )
  }

  const canContinue =
    step === 0 ? Boolean(service) : step === 1 ? Boolean(barber) : step === 2 ? Boolean(time) : true

  const goBack = () => {
    if (created) {
      navigate('/citas')
      return
    }
    if (step === 0) {
      navigate(-1)
      return
    }
    setStep((value) => value - 1)
  }

  const confirm = async () => {
    if (!service || !barber || !time || !user) return
    setSaving(true)
    try {
      const booking = await createBooking({
        userId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        barbershopId: shop.id,
        barberId: barber.id,
        serviceId: service.id,
        date,
        time,
        durationMin: service.durationMin,
        price: service.price,
        notes: notes.trim() || undefined,
      })
      setCreated(booking)
      toast('¡Cita reservada! Te esperamos.')
      window.scrollTo({ top: 0, behavior: 'instant' })
    } catch (error) {
      toast(error instanceof Error ? error.message : 'No se pudo reservar la cita', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    if (step === 3) {
      void confirm()
      return
    }
    setStep((value) => value + 1)
  }

  return (
    <div className="min-h-dvh bg-ink-100 md:bg-[radial-gradient(80%_60%_at_50%_0%,#2a2723_0%,#12100e_70%)]">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-stone-50 app-shadow md:max-w-lg">
        <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-stone-50/90 backdrop-blur-xl safe-top">
          <div className="flex h-14 items-center gap-2 px-3">
            <button
              type="button"
              onClick={goBack}
              aria-label="Volver"
              className="grid size-9 place-items-center rounded-full text-ink-700 transition hover:bg-ink-200/60"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-bold text-ink-900">
                {created ? 'Reserva confirmada' : 'Reservar cita'}
              </h1>
              <p className="truncate text-[11px] text-ink-500">{shop.name}</p>
            </div>
            {!created ? (
              <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600">
                {step + 1}/{steps.length}
              </span>
            ) : null}
          </div>

          {!created ? (
            <div className="px-4 pb-3">
              <div className="flex gap-1.5" aria-hidden>
                {steps.map((item, index) => (
                  <span
                    key={item}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition',
                      index <= step ? 'bg-ink-900' : 'bg-ink-200',
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-brand-600">
                {steps[step]}
              </p>
            </div>
          ) : null}
        </header>

        <div className="flex-1 px-4 pb-40 pt-4">
          {created ? (
            <div className="animate-rise space-y-5 py-6">
              <div className="flex flex-col items-center text-center">
                <span className="grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <Check className="size-10" strokeWidth={3} aria-hidden />
                </span>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink-900">
                  ¡Nos vemos pronto!
                </h2>
                <p className="mt-1 max-w-xs text-sm text-ink-500">
                  Tu cita en <strong className="text-ink-700">{shop.name}</strong> está pendiente de
                  confirmación por la barbería.
                </p>
              </div>

              <div className="space-y-3 rounded-3xl bg-white p-4 ring-1 ring-ink-200/70">
                <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-ink-400">Fecha y hora</p>
                    <p className="text-base font-bold text-ink-900">
                      {relativeDayLabel(created.date)} · {created.time} h
                    </p>
                  </div>
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-500/15 text-brand-700">
                    <CalendarDays className="size-5" aria-hidden />
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-ink-500">Servicio</span>
                    <span className="text-right font-semibold text-ink-900">{service?.name}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-ink-500">Barbero</span>
                    <span className="text-right font-semibold text-ink-900">{barber?.name}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-ink-500">Duración</span>
                    <span className="text-right font-semibold text-ink-900">
                      {service ? durationLabel(service.durationMin) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-ink-100 pt-2">
                    <span className="text-ink-500">A pagar en local</span>
                    <span className="text-right text-base font-extrabold text-ink-900">
                      {formatPrice(created.price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-[12px] text-brand-900 ring-1 ring-brand-200">
                <PartyPopper className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>
                  Puedes cancelar sin coste desde <strong>Mis citas</strong> hasta 2 horas antes.
                </p>
              </div>

              <div className="space-y-2">
                <Button full size="lg" onClick={() => navigate('/citas')}>
                  Ver mis citas
                </Button>
                <Button full variant="secondary" size="lg" onClick={() => navigate('/')}>
                  Explorar más barberías
                </Button>
              </div>
            </div>
          ) : (
            <div key={step} className="animate-rise space-y-4">
              {step === 0 ? (
                <>
                  <StepTitle
                    icon={<Scissors className="size-4" />}
                    title="¿Qué te vas a hacer?"
                    subtitle="Elige el servicio. El precio se paga en la barbería."
                  />
                  <div className="space-y-2">
                    {shop.services.map((item) => {
                      const active = item.id === serviceId
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setServiceId(item.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 transition',
                            active ? 'ring-2 ring-ink-900' : 'ring-ink-200 hover:ring-ink-300',
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-ink-900">{item.name}</p>
                            <p className="mt-0.5 text-xs text-ink-500">{item.description}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-500">
                              <Clock className="size-3" aria-hidden />
                              {durationLabel(item.durationMin)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-extrabold text-ink-900">{formatPrice(item.price)}</p>
                            <span
                              className={cn(
                                'mt-2 grid size-6 place-items-center rounded-full border transition',
                                active
                                  ? 'border-ink-900 bg-ink-900 text-white'
                                  : 'border-ink-300 text-transparent',
                              )}
                            >
                              <Check className="size-3.5" strokeWidth={3} aria-hidden />
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <StepTitle
                    icon={<UserRound className="size-4" />}
                    title="¿Con quién?"
                    subtitle="Cada barbero tiene su especialidad y su agenda."
                  />
                  <div className="space-y-2">
                    {shop.barbers.map((item) => {
                      const active = item.id === barberId
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBarberId(item.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 transition',
                            active ? 'ring-2 ring-ink-900' : 'ring-ink-200 hover:ring-ink-300',
                          )}
                        >
                          <Avatar name={item.name} size="lg" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-ink-900">{item.name}</p>
                            <p className="text-xs text-ink-500">{item.specialty}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-ink-600">
                              <Star className="size-3 fill-brand-400 text-brand-400" aria-hidden />
                              {item.rating.toFixed(1)} · {item.years} años de experiencia
                            </p>
                          </div>
                          <span
                            className={cn(
                              'grid size-6 shrink-0 place-items-center rounded-full border transition',
                              active
                                ? 'border-ink-900 bg-ink-900 text-white'
                                : 'border-ink-300 text-transparent',
                            )}
                          >
                            <Check className="size-3.5" strokeWidth={3} aria-hidden />
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <StepTitle
                    icon={<CalendarDays className="size-4" />}
                    title="Elige día y hora"
                    subtitle={
                      service
                        ? `${service.name} · ${durationLabel(service.durationMin)} con ${barber?.name.split(' ')[0]}`
                        : undefined
                    }
                  />

                  <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
                    <div className="flex gap-2">
                      {days.map((day) => {
                        const iso = toISODate(day)
                        const closed = shop.closedDays.includes(day.getDay())
                        const active = iso === date
                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={closed}
                            onClick={() => setDate(iso)}
                            className={cn(
                              'flex w-14 shrink-0 flex-col items-center rounded-2xl py-2.5 ring-1 transition',
                              active
                                ? 'bg-ink-900 text-white ring-ink-900'
                                : closed
                                  ? 'cursor-not-allowed bg-ink-100 text-ink-400 ring-ink-200'
                                  : 'bg-white text-ink-700 ring-ink-200 hover:ring-ink-300',
                            )}
                          >
                            <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
                              {new Intl.DateTimeFormat('es-ES', { weekday: 'short' })
                                .format(day)
                                .replace('.', '')}
                            </span>
                            <span className="text-lg font-bold leading-tight">{day.getDate()}</span>
                            <span className="text-[10px] opacity-70">
                              {closed
                                ? 'cerrado'
                                : new Intl.DateTimeFormat('es-ES', { month: 'short' })
                                    .format(day)
                                    .replace('.', '')}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {slots.length ? (
                    <>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs font-semibold text-ink-600">
                          {relativeDayLabel(date)}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {slots.filter((slot) => slot.available).length} huecos libres
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => {
                          const active = slot.time === time
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setTime(slot.time)}
                              className={cn(
                                'h-11 rounded-xl text-sm font-semibold transition',
                                active
                                  ? 'bg-ink-900 text-white shadow-sm'
                                  : slot.available
                                    ? 'bg-white text-ink-800 ring-1 ring-ink-200 hover:ring-ink-400'
                                    : 'cursor-not-allowed bg-ink-100 text-ink-300 line-through ring-1 ring-ink-100',
                              )}
                            >
                              {slot.time}
                            </button>
                          )
                        })}
                      </div>
                      <p className="flex items-start gap-1.5 text-[11px] text-ink-500">
                        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                        Los huecos tachados ya están ocupados. La cita se reserva solo para el tiempo del
                        servicio.
                      </p>
                    </>
                  ) : (
                    <EmptyState
                      icon={<CalendarDays className="size-5" />}
                      title="Cerrado este día"
                      message="La barbería no abre ese día. Prueba con otra fecha."
                    />
                  )}
                </>
              ) : null}

              {step === 3 && service && barber ? (
                <>
                  <StepTitle
                    icon={<Check className="size-4" />}
                    title="Revisa y confirma"
                    subtitle="Aún no se cobra nada. El pago se hace en la barbería."
                  />

                  <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-200/70">
                    <Cover
                      src={shop.cover}
                      alt={shop.name}
                      name={shop.name}
                      className="h-28"
                    >
                      <div className="absolute inset-x-4 bottom-3">
                        <p className="text-base font-bold text-white drop-shadow">{shop.name}</p>
                        <p className="text-[11px] text-white/75">{shop.address}</p>
                      </div>
                    </Cover>
                    <dl className="divide-y divide-ink-100 px-4">
                      <SummaryRow label="Servicio" value={service.name} />
                      <SummaryRow label="Barbero" value={barber.name} />
                      <SummaryRow label="Fecha" value={relativeDayLabel(date)} />
                      <SummaryRow label="Hora" value={`${time} h · ${durationLabel(service.durationMin)}`} />
                      <SummaryRow label="Total" value={formatPrice(service.price)} strong />
                    </dl>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="notas" className="block text-sm font-medium text-ink-700">
                      Notas para el barbero <span className="font-normal text-ink-400">(opcional)</span>
                    </label>
                    <textarea
                      id="notas"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value.slice(0, 200))}
                      rows={3}
                      placeholder="Ej.: degradado bajo, barba corta, tengo el pelo rizado…"
                      className="w-full resize-none rounded-2xl bg-white p-3.5 text-sm text-ink-900 ring-1 ring-ink-200 outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-ink-900"
                    />
                    <p className="text-right text-[11px] text-ink-400">{notes.length}/200</p>
                  </div>

                  <div className="flex items-start gap-2 rounded-2xl bg-white p-3 text-[11px] text-ink-500 ring-1 ring-ink-200/70">
                    <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    Podrás cancelar gratis desde <strong>Mis citas</strong> hasta 2 horas antes de la
                    reserva.
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {!created ? (
          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-ink-200/70 bg-stone-50/95 px-4 pb-3 pt-3 backdrop-blur-xl safe-bottom md:max-w-lg">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[11px] text-ink-500">{service ? service.name : 'Sin servicio'}</p>
                <p className="text-lg font-extrabold leading-none text-ink-900">
                  {service ? formatPrice(service.price) : '—'}
                </p>
              </div>
              <Button
                size="lg"
                className="ml-auto min-w-40 flex-1"
                disabled={!canContinue}
                loading={saving}
                onClick={handleNext}
              >
                {step === 3 ? 'Confirmar reserva' : 'Continuar'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function StepTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-2xl bg-ink-900 text-brand-400">
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-extrabold leading-tight text-ink-900">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p> : null}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-ink-500">{label}</dt>
      <dd className={cn('text-right', strong ? 'text-base font-extrabold text-ink-900' : 'font-semibold text-ink-800')}>
        {value}
      </dd>
    </div>
  )
}
