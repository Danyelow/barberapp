import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type ToastTone = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; tone: ToastTone }

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    counter.current += 1
    const id = counter.current
    setItems((current) => [...current, { id, message, tone }])
    setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={[
              'pointer-events-auto w-full max-w-sm rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ring-1 backdrop-blur',
              item.tone === 'success' && 'bg-stone-900/95 text-white ring-white/10',
              item.tone === 'error' && 'bg-red-600/95 text-white ring-red-400/40',
              item.tone === 'info' && 'bg-white/95 text-stone-900 ring-stone-200',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider')
  return context
}
