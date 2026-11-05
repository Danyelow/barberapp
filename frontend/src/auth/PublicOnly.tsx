import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'

/** Evita que un usuario con sesión vuelva a las pantallas de acceso. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  if (user) {
    return <Navigate to={from ?? (user.role === 'barbero' ? '/agenda' : '/')} replace />
  }

  return <>{children}</>
}
