import type { Barbershop } from '../data/barbershops'
import { isPast, minutesToTime, timeToMinutes, toISODate } from './date'

export type Slot = {
  time: string
  available: boolean
}

export type BusySlot = {
  time: string
  durationMin: number
}

type AvailabilityInput = {
  shop: Barbershop
  date: Date
  durationMin: number
  /** Citas ya ocupadas de ese barbero/a en esa fecha, con su duración real. */
  busy: BusySlot[]
}

export const SLOT_STEP_MIN = 30

export const getSlots = ({ shop, date, durationMin, busy }: AvailabilityInput): Slot[] => {
  const iso = toISODate(date)
  if (shop.closedDays.includes(date.getDay())) return []
  if (iso < toISODate(new Date())) return []

  const open = timeToMinutes(shop.opensAt)
  const close = timeToMinutes(shop.closesAt)
  const slots: Slot[] = []

  for (let start = open; start + durationMin <= close; start += SLOT_STEP_MIN) {
    const time = minutesToTime(start)
    const conflict = busy.some((item) => {
      const busyStart = timeToMinutes(item.time)
      const busyDuration = Math.max(item.durationMin, 1)
      return start < busyStart + busyDuration && busyStart < start + durationMin
    })
    const past = isPast(iso, time)

    slots.push({ time, available: !conflict && !past })
  }

  return slots
}

export const countAvailable = (slots: Slot[]) => slots.filter((slot) => slot.available).length
