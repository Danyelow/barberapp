import type { Service } from '../data/barbershops'
import type { User } from '../types'

export const RESTRICTED_SERVICE_MESSAGE =
  'Los servicios de barba solo están disponibles para clientes que se identifican como hombre.'

/**
 * Regla de negocio (también validada por la API de Django):
 * los servicios marcados como `onlyForMen` solo pueden reservarse si el
 * género autodeclarado en el registro es "hombre". Las clientas no ven
 * estos servicios ni en la ficha de la peluquería ni en la reserva.
 */
export const canRequestService = (service: Service, user: User | null | undefined) =>
  !service.onlyForMen || user?.gender === 'hombre'
