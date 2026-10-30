import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, Scissors, ShieldCheck, Store } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { BrandMark, AuthShell } from '../components/AppShell'
import { Button, Field } from '../components/ui'
import { useToast } from '../ui/ToastContext'
import type { User } from '../types'

export function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<'cliente' | 'barbero' | null>(null)

  const go = (user: User) => {
    if (from) {
      navigate(from, { replace: true })
      return
    }
    navigate(user.role === 'barbero' ? '/agenda' : '/', { replace: true })
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Escribe tu email y tu contraseña.')
      return
    }
    setLoading(true)
    try {
      const user = await login(email, password)
      toast(`¡Hola de nuevo, ${user.name.split(' ')[0]}!`)
      go(user)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (role: 'cliente' | 'barbero') => {
    setError('')
    setDemoLoading(role)
    try {
      const credentials =
        role === 'cliente'
          ? { email: 'cliente@barberapp.dev', password: '123456' }
          : { email: 'barbero@barberapp.dev', password: '123456' }
      const user = await login(credentials.email, credentials.password)
      toast(`Sesión demo iniciada como ${user.name.split(' ')[0]}`)
      go(user)
    } catch {
      setError('No se pudo iniciar la sesión de demostración.')
    } finally {
      setDemoLoading(null)
    }
  }

  return (
    <AuthShell>
      <div className="flex min-h-dvh flex-col px-5 safe-top">
        <div className="flex items-center justify-between py-4">
          <BrandMark />
          <Link to="/" className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-ink-100">
            Saltar
          </Link>
        </div>

        <div className="flex-1 pb-10 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-700">
            <Scissors className="size-3" aria-hidden />
            Tu barbería de confianza
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink-900">
            Bienvenido
            <br />
            de nuevo.
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            Entra para reservar, consultar y cancelar tus citas.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              icon={<Mail className="size-4" aria-hidden />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Field
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              hint="Mínimo 6 caracteres en la demo."
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error ? (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            ) : null}

            <Button type="submit" full size="lg" loading={loading}>
              Entrar
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
            <span className="h-px flex-1 bg-ink-200" />
            o entra en la demo
            <span className="h-px flex-1 bg-ink-200" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              full
              loading={demoLoading === 'cliente'}
              onClick={() => void demoLogin('cliente')}
              className="h-auto flex-col gap-1 py-3"
            >
              <Scissors className="size-4" aria-hidden />
              <span className="text-[13px]">Cliente</span>
              <span className="text-[10px] font-normal text-ink-500">cliente@barberapp.dev</span>
            </Button>
            <Button
              variant="secondary"
              full
              loading={demoLoading === 'barbero'}
              onClick={() => void demoLogin('barbero')}
              className="h-auto flex-col gap-1 py-3"
            >
              <Store className="size-4" aria-hidden />
              <span className="text-[13px]">Barbero</span>
              <span className="text-[10px] font-normal text-ink-500">barbero@barberapp.dev</span>
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-400">Contraseña de ambas cuentas: 123456</p>

          <p className="mt-6 text-center text-sm text-ink-500">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-ink-900 underline underline-offset-4">
              Crear una gratis
            </Link>
          </p>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-ink-400">
            <ShieldCheck className="size-3.5" aria-hidden />
            Demo con datos ficticios. No uses datos personales reales.
          </p>
        </div>
      </div>
    </AuthShell>
  )
}
