import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'

/** Evita que un usuario con sesión vuelva a las pantallas de acceso. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-stone-50">
        <span
          aria-label="Cargando sesión"
          className="size-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900"
        />
      </div>
    )
  }

  if (user) {
    return <Navigate to={from ?? (user.role === 'barbero' ? '/agenda' : '/')} replace />
  }

  return <>{children}</>
}
