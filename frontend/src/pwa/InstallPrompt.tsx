import { useEffect, useState } from 'react'
import { Download, Share, Smartphone } from 'lucide-react'
import { useToast } from '../ui/ToastContext'
import { Button } from '../components/ui'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<(available: boolean) => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    listeners.forEach((listener) => listener(true))
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    listeners.forEach((listener) => listener(false))
  })
}

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true)

export function useInstallPrompt() {
  const [available, setAvailable] = useState(Boolean(deferredPrompt))
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    listeners.add(setAvailable)
    return () => {
      listeners.delete(setAvailable)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return 'unavailable' as const
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      deferredPrompt = null
      setAvailable(false)
      setInstalled(true)
    }
    return outcome
  }

  return { available, installed, install }
}

export function InstallButton({ full = false }: { full?: boolean }) {
  const { available, installed, install } = useInstallPrompt()
  const { toast } = useToast()

  if (installed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
        <Smartphone className="size-3.5" aria-hidden />
        App instalada
      </span>
    )
  }

  const handleClick = async () => {
    const result = await install()
    if (result === 'unavailable') {
      toast('En iPhone: Compartir → Añadir a pantalla de inicio.', 'info')
    } else if (result === 'accepted') {
      toast('¡BarberApp instalada!')
    }
  }

  return (
    <Button variant={full ? 'primary' : 'secondary'} size="sm" full={full} onClick={handleClick}>
      {available ? <Download className="size-4" aria-hidden /> : <Share className="size-4" aria-hidden />}
      {available ? 'Instalar app' : 'Cómo instalar'}
    </Button>
  )
}
