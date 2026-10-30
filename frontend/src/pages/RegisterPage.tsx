import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Mail, Phone, UserRound } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { AuthShell, BrandMark } from '../components/AppShell'
import { Button, Field } from '../components/ui'
import { useToast } from '../ui/ToastContext'

export function RegisterPage() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
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
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const user = await register(form)
      toast(`Cuenta creada. ¡Bienvenido, ${user.name.split(' ')[0]}!`)
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
          <Link to="/entrar" className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-ink-100">
            Ya tengo cuenta
          </Link>
        </div>

        <div className="flex-1 pb-10 pt-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink-900">
            Crea tu cuenta.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Reserva en segundos y lleva todas tus citas en el móvil.
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
              Crear cuenta
              <ArrowRight className="size-4" aria-hidden />
            </Button>

            <p className="text-center text-[11px] leading-relaxed text-ink-400">
              Proyecto de demostración: la cuenta se guarda solo en este navegador. No introduzcas
              datos personales reales.
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
