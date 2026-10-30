import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '../components/ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-ink-900 text-brand-500">
        <Compass className="size-7" aria-hidden />
      </span>
      <p className="mt-4 text-4xl font-black tracking-tight text-ink-900">404</p>
      <h1 className="mt-1 text-lg font-bold text-ink-900">Esta página no existe</h1>
      <p className="mt-1 max-w-xs text-sm text-ink-500">
        Puede que el enlace esté mal escrito o que la barbería ya no esté disponible.
      </p>
      <Link to="/" className="mt-5">
        <Button size="lg">Volver al inicio</Button>
      </Link>
    </div>
  )
}
