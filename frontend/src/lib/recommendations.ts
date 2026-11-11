import type { Barbershop, Service } from '../data/barbershops'
import type { User } from '../types'
import { distanceKm } from './geo'
import type { Coordinates } from './geo'
import { canRequestService } from './services'

const STOP_WORDS = new Set([
  'de',
  'del',
  'con',
  'y',
  'el',
  'la',
  'los',
  'las',
  'para',
  'en',
  'un',
  'una',
  'tu',
  'su',
  'al',
  'por',
  'mas',
  'plus',
])

export const normalizeServiceName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const tokens = (value: string) =>
  normalizeServiceName(value)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))

const matchScore = (serviceName: string, preferredName: string) => {
  const serviceKey = normalizeServiceName(serviceName)
  const preferredKey = normalizeServiceName(preferredName)
  if (!serviceKey || !preferredKey) return 0
  if (serviceKey === preferredKey) return 100

  const serviceTokens = new Set(tokens(serviceKey))
  const preferredTokens = tokens(preferredKey)
  if (!serviceTokens.size || !preferredTokens.length) return 0

  const matches = preferredTokens.filter((token) => serviceTokens.has(token)).length
  if (!matches) return 0

  const coverage = matches / preferredTokens.length
  const containsBonus = serviceKey.includes(preferredKey) || preferredKey.includes(serviceKey) ? 2 : 0
  return coverage * 10 + containsBonus
}

export type PreferredServiceOption = {
  value: string
  label: string
}

export function preferredServiceOptions(shops: Barbershop[], user: User | null | undefined) {
  const names = new Map<string, string>()

  for (const shop of shops) {
    for (const service of shop.services) {
      if (!canRequestService(service, user)) continue
      const key = normalizeServiceName(service.name)
      if (key && !names.has(key)) names.set(key, service.name)
    }
  }

  return [...names.values()]
    .map((label) => ({ value: label, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
}

export type ShopRecommendation = {
  shop: Barbershop
  service: Service
  distance: number
  matchScore: number
}

export function recommendShops({
  shops,
  user,
  preferredService,
  from,
  limit = 3,
}: {
  shops: Barbershop[]
  user: User | null | undefined
  preferredService: string | null
  from: Coordinates
  limit?: number
}): ShopRecommendation[] {
  const preferredKey = preferredService ? normalizeServiceName(preferredService) : ''

  const rows = shops.flatMap((shop) => {
    const eligible = shop.services.filter((service) => canRequestService(service, user))
    if (!eligible.length) return []

    let bestService = eligible[0]
    let bestScore = 0

    if (preferredKey) {
      for (const service of eligible) {
        const score = matchScore(service.name, preferredService ?? '')
        if (score > bestScore) {
          bestScore = score
          bestService = service
        }
      }
      if (!bestScore) return []
    } else {
      bestService = [...eligible].sort((a, b) => a.price - b.price)[0]
    }

    return [
      {
        shop,
        service: bestService,
        distance: distanceKm(from.lat, from.lng, shop.lat, shop.lng),
        matchScore: bestScore,
      },
    ]
  })

  rows.sort((a, b) => {
    if (preferredKey && b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    if (a.distance !== b.distance) return a.distance - b.distance
    return a.shop.name.localeCompare(b.shop.name, 'es')
  })

  return rows.slice(0, limit)
}
