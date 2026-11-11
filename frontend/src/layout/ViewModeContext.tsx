import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type ViewPreference = 'auto' | 'desktop' | 'mobile'

const STORAGE_KEY = 'barberapp.view.v1'
const AUTO_DESKTOP_QUERY = '(min-width: 1024px)'
const DESKTOP_MIN_QUERY = '(min-width: 768px)'

function readPreference(): ViewPreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'desktop' || value === 'mobile') return value
  } catch {
    /* almacenamiento no disponible */
  }
  return 'auto'
}

const matches = (query: string) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches

type ViewModeContextValue = {
  preference: ViewPreference
  isDesktop: boolean
  setPreference: (value: ViewPreference) => void
  useDesktop: () => void
  useMobile: () => void
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null)

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ViewPreference>(readPreference)
  const [autoDesktop, setAutoDesktop] = useState(() => matches(AUTO_DESKTOP_QUERY))
  const [canUseDesktop, setCanUseDesktop] = useState(() => matches(DESKTOP_MIN_QUERY))

  useEffect(() => {
    const autoMedia = window.matchMedia(AUTO_DESKTOP_QUERY)
    const minMedia = window.matchMedia(DESKTOP_MIN_QUERY)
    const handleAuto = (event: MediaQueryListEvent) => setAutoDesktop(event.matches)
    const handleMin = (event: MediaQueryListEvent) => setCanUseDesktop(event.matches)

    setAutoDesktop(autoMedia.matches)
    setCanUseDesktop(minMedia.matches)
    autoMedia.addEventListener('change', handleAuto)
    minMedia.addEventListener('change', handleMin)
    return () => {
      autoMedia.removeEventListener('change', handleAuto)
      minMedia.removeEventListener('change', handleMin)
    }
  }, [])

  const isDesktop =
    canUseDesktop && (preference === 'desktop' || (preference === 'auto' && autoDesktop))

  useEffect(() => {
    document.documentElement.dataset.view = isDesktop ? 'desktop' : 'mobile'
  }, [isDesktop])

  const setPreference = useCallback((value: ViewPreference) => {
    setPreferenceState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* almacenamiento no disponible */
    }
  }, [])

  const value = useMemo(
    () => ({
      preference,
      isDesktop,
      setPreference,
      useDesktop: () => setPreference('desktop'),
      useMobile: () => setPreference('mobile'),
    }),
    [preference, isDesktop, setPreference],
  )

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
}

export const useViewMode = () => {
  const context = useContext(ViewModeContext)
  if (!context) throw new Error('useViewMode debe usarse dentro de ViewModeProvider')
  return context
}
