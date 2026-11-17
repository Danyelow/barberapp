import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

const AUTO_DESKTOP_QUERY = '(min-width: 1024px)'
const DESKTOP_MIN_QUERY = '(min-width: 768px)'

const matches = (query: string) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches

type ViewModeContextValue = {
  isDesktop: boolean
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null)

export function ViewModeProvider({ children }: { children: ReactNode }) {
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

  const isDesktop = canUseDesktop && autoDesktop

  useEffect(() => {
    document.documentElement.dataset.view = isDesktop ? 'desktop' : 'mobile'
  }, [isDesktop])

  const value = useMemo(() => ({ isDesktop }), [isDesktop])

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
}

export const useViewMode = () => {
  const context = useContext(ViewModeContext)
  if (!context) throw new Error('useViewMode debe usarse dentro de ViewModeProvider')
  return context
}
