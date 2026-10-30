import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { mockApi } from '../api/mockApi'
import type { User } from '../types'

type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => mockApi.restoreSession())

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await mockApi.login(email, password)
    setUser(nextUser)
    return nextUser
  }, [])

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) => {
      const nextUser = await mockApi.register(input)
      setUser(nextUser)
      return nextUser
    },
    [],
  )

  const logout = useCallback(() => {
    mockApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
