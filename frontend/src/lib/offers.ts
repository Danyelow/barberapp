import type { Barbershop } from '../data/barbershops'
import { distanceKm } from './geo'
import type { Coordinates } from './geo'

/** Las ofertas solo adelantan posiciones si la peluquería está razonablemente cerca. */
export const OFFER_PRIORITY_RADIUS_KM = 6
export const OFFER_DISTANCE_BONUS_KM = 1.5

const shopDistance = (shop: Barbershop, from: Coordinates) =>
  distanceKm(from.lat, from.lng, shop.lat, shop.lng)

/**
 * Distancia usada para ordenar. Una oferta cercana resta 1,5 km, de modo que
 * sube puestos sin que una oferta lejana tape una peluquería que está al lado.
 */
export const sortDistance = (shop: Barbershop, from: Coordinates) => {
  const distance = shopDistance(shop, from)
  if (shop.offer && distance <= OFFER_PRIORITY_RADIUS_KM) {
    return Math.max(0, distance - OFFER_DISTANCE_BONUS_KM)
  }
  return distance
}

export const sortShopsByProximity = (shops: Barbershop[], from: Coordinates) =>
  [...shops].sort((a, b) => {
    const distanceA = sortDistance(a, from)
    const distanceB = sortDistance(b, from)
    if (distanceA !== distanceB) return distanceA - distanceB
    return shopDistance(a, from) - shopDistance(b, from)
  })

export const nearbyOffers = (shops: Barbershop[], from: Coordinates) =>
  shops
    .map((shop) => ({ shop, distance: shopDistance(shop, from) }))
    .filter(
      ({ shop, distance }) => Boolean(shop.offer) && distance <= OFFER_PRIORITY_RADIUS_KM,
    )
    .sort((a, b) => a.distance - b.distance)
    .map(({ shop }) => shop)
