import type { Barbershop } from '../data/barbershops'
import { isPast, minutesToTime, timeToMinutes, toISODate } from './date'

export type Slot = {
  time: string
  available: boolean
}

/** Hash determinista para simular ocupación realista por barbero y fecha. */
const hash = (value: string) => {
  let result = 0
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 100000
  }
  return result
}

type AvailabilityInput = {
  shop: Barbershop
  barberId: string
  date: Date
  durationMin: number
  /** Horas ya ocupadas ("10:30") de ese barbero en esa fecha. */
  takenTimes: string[]
}

export const SLOT_STEP_MIN = 30

export const getSlots = ({ shop, barberId, date, durationMin, takenTimes }: AvailabilityInput): Slot[] => {
  const iso = toISODate(date)
  if (shop.closedDays.includes(date.getDay())) return []
  if (iso < toISODate(new Date())) return []

  const open = timeToMinutes(shop.opensAt)
  const close = timeToMinutes(shop.closesAt)
  const taken = new Set(takenTimes.map(timeToMinutes))
  const slots: Slot[] = []

  for (let start = open; start + durationMin <= close; start += SLOT_STEP_MIN) {
    const time = minutesToTime(start)
    const conflict = [...taken].some(
      (busyStart) => start < busyStart + durationMin && busyStart < start + durationMin,
    )
    const simulatedBusy = hash(`${barberId}-${iso}-${time}`) % 7 === 0
    const past = isPast(iso, time)

    slots.push({ time, available: !conflict && !simulatedBusy && !past })
  }

  return slots
}

export const countAvailable = (slots: Slot[]) => slots.filter((slot) => slot.available).length
