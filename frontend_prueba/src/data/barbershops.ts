export type Service = {
  id: string
  name: string
  description: string
  durationMin: number
  price: number
}

export type Barber = {
  id: string
  name: string
  specialty: string
  rating: number
  years: number
}

export type Barbershop = {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
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
}

const cover = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

export const barbershops: Barbershop[] = [
  {
    id: 'el-clasico',
    name: 'El Clásico Barbería',
    address: 'Calle de Fuencarral, 45',
    city: 'Madrid',
    lat: 40.4236,
    lng: -3.7038,
    rating: 4.9,
    reviews: 248,
    priceLevel: 2,
    cover: cover('photo-1503951914875-452162b0f3f1'),
    description:
      'Barbería de barrio con alma de otra época. Cortes clásicos, afeitado a navaja y un café mientras esperas.',
    phone: '+34 910 12 34 56',
    tags: ['Corte clásico', 'Afeitado a navaja', 'Fade'],
    opensAt: '10:00',
    closesAt: '20:30',
    closedDays: [0],
    services: [
      { id: 'corte', name: 'Corte clásico', description: 'Tijera y máquina, lavado y peinado', durationMin: 30, price: 18 },
      { id: 'fade', name: 'Fade + barba', description: 'Degradado a máquina y perfilado de barba', durationMin: 45, price: 25 },
      { id: 'navaja', name: 'Afeitado a navaja', description: 'Toalla caliente, aceites y after-shave', durationMin: 30, price: 20 },
      { id: 'nino', name: 'Corte infantil', description: 'Hasta 12 años, con paciencia extra', durationMin: 25, price: 14 },
    ],
    barbers: [
      { id: 'mateo', name: 'Mateo Ruiz', specialty: 'Clásico y navaja', rating: 4.9, years: 12 },
      { id: 'andres', name: 'Andrés Vidal', specialty: 'Fade', rating: 4.8, years: 7 },
      { id: 'nuria', name: 'Nuria Sanz', specialty: 'Barba y perfilado', rating: 5, years: 5 },
    ],
  },
  {
    id: 'nordic-fade',
    name: 'Nordic Fade Studio',
    address: 'Calle de Velarde, 12',
    city: 'Madrid',
    lat: 40.427,
    lng: -3.705,
    rating: 4.7,
    reviews: 156,
    priceLevel: 3,
    cover: cover('photo-1585747860715-2ba37e788b70'),
    description:
      'Estudio nórdico especializado en degradados limpios, texturizados y color. Reserva con antelación, se llena rápido.',
    phone: '+34 910 77 88 99',
    tags: ['Fade', 'Color', 'Diseño'],
    opensAt: '11:00',
    closesAt: '21:00',
    closedDays: [0, 1],
    services: [
      { id: 'signature', name: 'Nordic Signature', description: 'Corte a medida con lavado y styling', durationMin: 45, price: 28 },
      { id: 'skin', name: 'Skin fade', description: 'Degradado a piel con acabado a navaja', durationMin: 40, price: 24 },
      { id: 'color', name: 'Color / platinado', description: 'Decoloración y tono personalizado', durationMin: 90, price: 55 },
      { id: 'barba', name: 'Arreglo de barba', description: 'Diseño y perfilado con toalla caliente', durationMin: 25, price: 16 },
    ],
    barbers: [
      { id: 'lukas', name: 'Lukas Berg', specialty: 'Skin fade', rating: 4.8, years: 9 },
      { id: 'ines', name: 'Inés Ferrer', specialty: 'Color y textura', rating: 4.7, years: 6 },
    ],
  },
  {
    id: 'la-navaja',
    name: 'Barbería La Navaja',
    address: 'Plaza de Cascorro, 8',
    city: 'Madrid',
    lat: 40.4108,
    lng: -3.7078,
    rating: 4.6,
    reviews: 312,
    priceLevel: 1,
    cover: cover('photo-1599351431202-1e0f0137899a'),
    description:
      'Ambiente de mercado, música alta y cortes rápidos. La relación calidad-precio del centro.',
    phone: '+34 911 45 67 89',
    tags: ['Económico', 'Clásico', 'Sin cita previa'],
    opensAt: '09:30',
    closesAt: '20:00',
    closedDays: [0],
    services: [
      { id: 'rapido', name: 'Corte exprés', description: 'Máquina y repaso en 20 minutos', durationMin: 20, price: 12 },
      { id: 'completo', name: 'Corte + barba', description: 'El pack de la casa', durationMin: 45, price: 22 },
      { id: 'afeitado', name: 'Afeitado tradicional', description: 'Navaja, espuma y bálsamo', durationMin: 30, price: 15 },
    ],
    barbers: [
      { id: 'paco', name: 'Paco Delgado', specialty: 'Clásico rápido', rating: 4.6, years: 20 },
      { id: 'raul', name: 'Raúl Moreno', specialty: 'Barba', rating: 4.5, years: 4 },
      { id: 'sara', name: 'Sara Ortiz', specialty: 'Corte exprés', rating: 4.8, years: 3 },
    ],
  },
  {
    id: 'gentlemans-room',
    name: "The Gentleman's Room",
    address: 'Calle de Serrano, 30',
    city: 'Madrid',
    lat: 40.4315,
    lng: -3.6875,
    rating: 4.8,
    reviews: 189,
    priceLevel: 3,
    cover: cover('photo-1517832606299-7ae9b720a186'),
    description:
      'Club privado de barbería en Salamanca. Reserva por franjas, whisky de cortesía y servicio de guante blanco.',
    phone: '+34 912 33 44 55',
    tags: ['Premium', 'Club', 'Navaja'],
    opensAt: '10:00',
    closesAt: '20:00',
    closedDays: [0],
    services: [
      { id: 'club', name: 'The Club Cut', description: 'Corte, lavado, masaje y styling', durationMin: 60, price: 45 },
      { id: 'ritual', name: 'Ritual de afeitado', description: 'Afeitado completo en 45 minutos', durationMin: 45, price: 38 },
      { id: 'barba', name: 'Escultura de barba', description: 'Diseño con navaja y aceites', durationMin: 30, price: 26 },
    ],
    barbers: [
      { id: 'gonzalo', name: 'Gonzalo Prieto', specialty: 'Master barber', rating: 5, years: 15 },
      { id: 'clara', name: 'Clara Ibáñez', specialty: 'Ritual de afeitado', rating: 4.9, years: 8 },
    ],
  },
  {
    id: 'corte-co',
    name: 'Corte & Co.',
    address: 'Calle de Atocha, 80',
    city: 'Madrid',
    lat: 40.413,
    lng: -3.699,
    rating: 4.5,
    reviews: 97,
    priceLevel: 2,
    cover: cover('photo-1621605815971-fbc98d665033'),
    description:
      'Espacio moderno cerca de Antón Martín. Especialistas en texturas, rizos y cortes sin género.',
    phone: '+34 913 22 11 00',
    tags: ['Rizos', 'Sin género', 'Moderno'],
    opensAt: '10:30',
    closesAt: '20:30',
    closedDays: [0],
    services: [
      { id: 'textura', name: 'Corte texturizado', description: 'Para pelo liso o con movimiento', durationMin: 40, price: 23 },
      { id: 'rizos', name: 'Método rizos', description: 'Corte en seco y definición', durationMin: 60, price: 32 },
      { id: 'barba', name: 'Perfilado de barba', description: 'Líneas limpias y bálsamo', durationMin: 20, price: 13 },
      { id: 'duo', name: 'Corte + barba', description: 'Servicio completo', durationMin: 55, price: 30 },
    ],
    barbers: [
      { id: 'alba', name: 'Alba Márquez', specialty: 'Rizos', rating: 4.7, years: 6 },
      { id: 'hugo', name: 'Hugo Leal', specialty: 'Texturas', rating: 4.4, years: 5 },
    ],
  },
  {
    id: 'distrito-9',
    name: 'Distrito 9 Barber',
    address: 'Calle de Bravo Murillo, 120',
    city: 'Madrid',
    lat: 40.448,
    lng: -3.704,
    rating: 4.4,
    reviews: 74,
    priceLevel: 1,
    cover: cover('photo-1493256338651-d82f7acb2b38'),
    description:
      'Barbería de barrio en Chamberí, fiel a los cortes de siempre y con precios de toda la vida.',
    phone: '+34 914 55 66 77',
    tags: ['Barrio', 'Económico', 'Familiar'],
    opensAt: '09:00',
    closesAt: '19:30',
    closedDays: [0],
    services: [
      { id: 'clasico', name: 'Corte de siempre', description: 'Máquina, tijera y peine', durationMin: 30, price: 14 },
      { id: 'barba', name: 'Barba', description: 'Recorte y perfilado', durationMin: 20, price: 9 },
      { id: 'pack', name: 'Pack padre e hijo', description: 'Dos cortes seguidos', durationMin: 55, price: 22 },
    ],
    barbers: [
      { id: 'julian', name: 'Julián Ramos', specialty: 'Clásico', rating: 4.4, years: 22 },
      { id: 'vera', name: 'Vera Costa', specialty: 'Familia', rating: 4.6, years: 2 },
    ],
  },
]

export const findBarbershop = (id: string) => barbershops.find((shop) => shop.id === id)

export const findBarber = (shopId: string, barberId: string) =>
  findBarbershop(shopId)?.barbers.find((barber) => barber.id === barberId)

export const findService = (shopId: string, serviceId: string) =>
  findBarbershop(shopId)?.services.find((service) => service.id === serviceId)
