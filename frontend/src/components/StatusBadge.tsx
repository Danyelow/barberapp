import { Badge } from './ui'
import type { BookingStatus } from '../types'

const map: Record<BookingStatus, { label: string; tone: 'success' | 'warning' | 'neutral' | 'danger' }> = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  confirmada: { label: 'Confirmada', tone: 'success' },
  completada: { label: 'Completada', tone: 'neutral' },
  cancelada: { label: 'Cancelada', tone: 'danger' },
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, tone } = map[status]
  return (
    <Badge tone={tone}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </Badge>
  )
}
