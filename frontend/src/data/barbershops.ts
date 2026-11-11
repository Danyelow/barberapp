export type ShopType = 'hombres' | 'mujeres' | 'unisex'

export type Service = {
  id: string
  name: string
  description: string
  durationMin: number
  price: number
  /** Servicio de barba: solo visible y reservable para clientes hombre. */
  onlyForMen?: boolean
}

export type Barber = {
  id: string
  name: string
  specialty: string
  rating: number
  years: number
}

export type Offer = {
  title: string
  description: string
  discountPercent: number
  validUntil?: string | null
}

export type Barbershop = {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  shopType: ShopType
  rating: number
  reviews: number
  priceLevel: 1 | 2 | 3
  cover: string
  description: string
  phone: string
  tags: string[]
  opensAt: string
  closesAt: string
  /** 0 = domingo … 6 = sábado */
  closedDays: number[]
  services: Service[]
  barbers: Barber[]
  /** Oferta activa devuelta por la API; si no hay, queda vacío o null. */
  offer?: Offer | null
}

export const shopTypeLabel = (type: ShopType) => {
  if (type === 'hombres') return 'Peluquería de hombres'
  if (type === 'mujeres') return 'Peluquería de mujeres'
  return 'Peluquería unisex'
}

export const shopTypeShortLabel = (type: ShopType) => {
  if (type === 'hombres') return 'Hombres'
  if (type === 'mujeres') return 'Mujeres'
  return 'Unisex'
}
