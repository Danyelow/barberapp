import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Mail, Phone, UserRound } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { AuthShell, BrandMark } from '../components/AppShell'
import { Button, Field, SelectField } from '../components/ui'
import { ThemeToggle } from '../theme/ThemeToggle'
import { useToast } from '../ui/ToastContext'
import type { Gender } from '../types'

export function RegisterPage() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '' as Gender | '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update =
    (key: 'name' | 'email' | 'phone' | 'password') =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (form.name.trim().length < 3) {
      setError('Escribe tu nombre completo.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError('El email no tiene un formato válido.')
      return
    }
    if (form.phone.replace(/\D/g, '').length < 9) {
      setError('Escribe un teléfono de al menos 9 dígitos.')
      return
    }
    if (!form.gender) {
      setError('Selecciona cómo te identificas.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        gender: form.gender,
      })
      toast(`¡Hola, ${user.name.split(' ')[0]}! Tu cuenta de cliente ya está lista.`)
      navigate('/', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="flex min-h-dvh flex-col px-5 safe-top">
        <div className="flex items-center justify-between py-4">
          <BrandMark />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link to="/entrar" className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-ink-100">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="flex-1 pb-10 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-700">
            <UserRound className="size-3" aria-hidden />
            Cuenta de cliente
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink-900">
            Crea tu cuenta.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Reserva en segundos y lleva todas tus citas en el móvil.
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Solo se permite el registro de clientes. Las cuentas de barbero las crea la
            administración de BarberApp.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3.5" noValidate>
            <Field
              label="Nombre y apellidos"
              name="name"
              autoComplete="name"
              placeholder="Lucía Gómez"
              icon={<UserRound className="size-4" aria-hidden />}
              value={form.name}
              onChange={update('name')}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              icon={<Mail className="size-4" aria-hidden />}
              value={form.email}
              onChange={update('email')}
            />
            <Field
              label="Teléfono"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+34 600 000 000"
              icon={<Phone className="size-4" aria-hidden />}
              value={form.phone}
              onChange={update('phone')}
            />
            <SelectField
              label="¿Cómo te identificas?"
              name="gender"
              value={form.gender}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  gender: event.target.value as Gender | '',
                }))
              }
              hint="Lo usamos para adaptar los servicios y las peluquerías que te mostramos."
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="no_binario">No binario</option>
              <option value="prefiero_no_decir">Prefiero no decirlo</option>
            </SelectField>
            <Field
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              icon={<Lock className="size-4" aria-hidden />}
              value={form.password}
              onChange={update('password')}
            />

            {error ? (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            ) : null}

            <Button type="submit" full size="lg" loading={loading}>
              Crear cuenta de cliente
              <ArrowRight className="size-4" aria-hidden />
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-ink-400">
              Proyecto de demostración: la cuenta se guarda en el servidor de BarberApp. No
              introduzcas datos personales reales.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            ¿Ya estás registrado?{' '}
            <Link to="/entrar" className="font-semibold text-ink-900 underline underline-offset-4">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  )
}
