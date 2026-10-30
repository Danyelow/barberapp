/** Utilidades de fecha/hora sin dependencias externas. */

export const toISODate = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseISODate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const nextDays = (count: number, from = new Date()) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(from)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + index)
    return date
  })

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const formatWeekdayShort = (date: Date) =>
  capitalize(new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date).replace('.', ''))

export const formatDayNumber = (date: Date) => `${date.getDate()}`

export const formatMonthShort = (date: Date) =>
  capitalize(new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).replace('.', ''))

export const formatLongDate = (iso: string) =>
  capitalize(
    new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(parseISODate(iso)),
  )

export const formatShortDate = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(parseISODate(iso))

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)

export const durationLabel = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const minutesToTime = (minutes: number) =>
  `${`${Math.floor(minutes / 60)}`.padStart(2, '0')}:${`${minutes % 60}`.padStart(2, '0')}`

export const relativeDayLabel = (iso: string) => {
  const today = toISODate(new Date())
  const tomorrow = toISODate(new Date(Date.now() + 24 * 60 * 60 * 1000))
  if (iso === today) return 'Hoy'
  if (iso === tomorrow) return 'Mañana'
  return formatLongDate(iso)
}

export const isPast = (iso: string, time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const date = parseISODate(iso)
  date.setHours(hours, minutes, 0, 0)
  return date.getTime() < Date.now()
}
