import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'barberapp.theme.v1'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    /* almacenamiento no disponible */
  }
  return 'system'
}

const systemIsDark = () =>
  typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches

type ThemeContextValue = {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (value: ThemePreference) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [systemDark, setSystemDark] = useState(systemIsDark)

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)

    setSystemDark(media.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const resolvedTheme: ResolvedTheme =
    preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme

    const themeMeta = document.querySelector('meta[name="theme-color"]')
    themeMeta?.setAttribute('content', resolvedTheme === 'dark' ? '#14120f' : '#f7f6f4')
    const schemeMeta = document.querySelector('meta[name="color-scheme"]')
    schemeMeta?.setAttribute('content', resolvedTheme === 'dark' ? 'dark' : 'light')
  }, [resolvedTheme])

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* almacenamiento no disponible */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    setPreference(next)
  }, [resolvedTheme, setPreference])

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference, toggleTheme }),
    [preference, resolvedTheme, setPreference, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return context
}
