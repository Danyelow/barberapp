import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CircleHelp, LogOut, Monitor, Moon, ShieldCheck, Sun } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/AppShell'
import { useTheme } from '../theme/ThemeContext'
import { Badge, Button, Sheet } from '../components/ui'
import { useToast } from '../ui/ToastContext'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { preference: themePreference, resolvedTheme, setPreference: setThemePreference } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setLogoutOpen(false)
    toast('Sesión cerrada. ¡Hasta pronto!', 'info')
    navigate('/')
  }

  return (
    <div className="pb-28">
      <PageHeader title="Perfil" subtitle="Ajustes y preferencias" />

      <div className="page-container space-y-4 px-4 pt-4">
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
              <p className="text-sm font-semibold text-ink-900">Tema de app</p>
              <p className="text-[11px] text-ink-500">Claro, oscuro o automático</p>
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
