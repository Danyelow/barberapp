export type ShopType = 'hombres' | 'mujeres'

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
}

const cover = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

export const shopTypeLabel = (type: ShopType) =>
  type === 'hombres' ? 'Peluquería de hombres' : 'Peluquería de mujeres'

export const shopTypeShortLabel = (type: ShopType) => (type === 'hombres' ? 'Hombres' : 'Mujeres')

/**
 * Datos de demostración ubicados en barrios reales de Sevilla.
 * Las coordenadas son reales para que las distancias se calculen desde la
 * ubicación del navegador, no desde una posición fija.
 */
export const barbershops: Barbershop[] = [
  {
    id: 'el-clasico',
    name: 'Barbería Triana',
    address: 'Calle Betis, 42, Triana',
    city: 'Sevilla',
    lat: 37.3839,
    lng: -6.0028,
    shopType: 'hombres',
    rating: 4.9,
    reviews: 248,
    priceLevel: 2,
    cover: cover('photo-1503951914875-452162b0f3f1'),
    description:
      'Barbería de barrio a orillas del Guadalquivir. Cortes clásicos, afeitado a navaja y café de máquina mientras esperas.',
    phone: '+34 954 12 34 56',
    tags: ['Corte clásico', 'Afeitado a navaja', 'Fade'],
    opensAt: '10:00',
    closesAt: '20:30',
    closedDays: [0],
    services: [
      {
        id: 'corte',
        name: 'Corte clásico',
        description: 'Tijera y máquina, lavado y peinado',
        durationMin: 30,
        price: 18,
      },
      {
        id: 'fade',
        name: 'Fade y textura',
        description: 'Degradado a máquina y acabado con textura',
        durationMin: 45,
        price: 25,
      },
      {
        id: 'navaja',
        name: 'Afeitado a navaja',
        description: 'Toalla caliente, aceites y after-shave',
        durationMin: 30,
        price: 20,
        onlyForMen: true,
      },
      {
        id: 'nino',
        name: 'Corte infantil',
        description: 'Hasta 12 años, con paciencia extra',
        durationMin: 25,
        price: 14,
      },
    ],
    barbers: [
      { id: 'mateo', name: 'Mateo Ruiz', specialty: 'Clásico y navaja', rating: 4.9, years: 12 },
      { id: 'andres', name: 'Andrés Vidal', specialty: 'Fade', rating: 4.8, years: 7 },
      { id: 'nuria', name: 'Nuria Sanz', specialty: 'Barba y perfilado', rating: 5, years: 5 },
    ],
  },
  {
    id: 'nordic-fade',
    name: 'Barbería La Giralda',
    address: 'Calle Mateos Gago, 12, Santa Cruz',
    city: 'Sevilla',
    lat: 37.3862,
    lng: -5.9906,
    shopType: 'hombres',
    rating: 4.7,
    reviews: 156,
    priceLevel: 3,
    cover: cover('photo-1585747860715-2ba37e788b70'),
    description:
      'Estudio junto a la Giralda especializado en degradados limpios, texturizados y color. Reserva con antelación, se llena rápido.',
    phone: '+34 954 77 88 99',
    tags: ['Fade', 'Color', 'Diseño'],
    opensAt: '11:00',
    closesAt: '21:00',
    closedDays: [0, 1],
    services: [
      {
        id: 'signature',
        name: 'Giralda Signature',
        description: 'Corte a medida con lavado y styling',
        durationMin: 45,
        price: 28,
      },
      {
        id: 'skin',
        name: 'Skin fade',
        description: 'Degradado a piel con acabado a navaja',
        durationMin: 40,
        price: 24,
      },
      {
        id: 'color',
        name: 'Color / platinado',
        description: 'Decoloración y tono personalizado',
        durationMin: 90,
        price: 55,
      },
      {
        id: 'barba',
        name: 'Arreglo de barba',
        description: 'Diseño y perfilado con toalla caliente',
        durationMin: 25,
        price: 16,
        onlyForMen: true,
      },
    ],
    barbers: [
      { id: 'lukas', name: 'Lucas Vega', specialty: 'Skin fade', rating: 4.8, years: 9 },
      { id: 'ines', name: 'Inés Ferrer', specialty: 'Color y textura', rating: 4.7, years: 6 },
    ],
  },
  {
    id: 'la-navaja',
    name: 'Peluquería La Torre del Oro',
    address: 'Paseo de Colón, 8, El Arenal',
    city: 'Sevilla',
    lat: 37.3828,
    lng: -5.9971,
    shopType: 'mujeres',
    rating: 4.6,
    reviews: 312,
    priceLevel: 2,
    cover: cover('photo-1560066984-138dadb4c035'),
    description:
      'Peluquería luminosa junto al río, especializada en cortes femeninos, color y peinados para eventos.',
    phone: '+34 954 45 67 89',
    tags: ['Corte femenino', 'Mechas', 'Peinados'],
    opensAt: '09:30',
    closesAt: '20:00',
    closedDays: [0],
    services: [
      {
        id: 'rapido',
        name: 'Corte y peinado',
        description: 'Corte, lavado y secado con acabado natural',
        durationMin: 40,
        price: 20,
      },
      {
        id: 'completo',
        name: 'Corte + tratamiento',
        description: 'Corte personalizado, mascarilla y peinado',
        durationMin: 60,
        price: 35,
      },
      {
        id: 'color',
        name: 'Color y mechas',
        description: 'Coloración completa o mechas con diagnóstico previo',
        durationMin: 90,
        price: 48,
      },
      {
        id: 'recogido',
        name: 'Recogido de invitada',
        description: 'Peinado de fiesta o boda con fijación duradera',
        durationMin: 50,
        price: 32,
      },
    ],
    barbers: [
      { id: 'paco', name: 'Paco Delgado', specialty: 'Corte y color', rating: 4.6, years: 20 },
      { id: 'raul', name: 'Raúl Moreno', specialty: 'Peinados', rating: 4.5, years: 4 },
      { id: 'sara', name: 'Sara Ortiz', specialty: 'Corte femenino', rating: 4.8, years: 8 },
    ],
  },
  {
    id: 'gentlemans-room',
    name: 'Barbería El Arenal',
    address: 'Calle Adriano, 21, El Arenal',
    city: 'Sevilla',
    lat: 37.3852,
    lng: -5.9973,
    shopType: 'hombres',
    rating: 4.8,
    reviews: 189,
    priceLevel: 3,
    cover: cover('photo-1517832606299-7ae9b720a186'),
    description:
      'Club de barbería cerca de la Maestranza. Reserva por franjas, trato cuidado y servicio de guante blanco.',
    phone: '+34 954 33 44 55',
    tags: ['Premium', 'Club', 'Navaja'],
    opensAt: '10:00',
    closesAt: '20:00',
    closedDays: [0],
    services: [
      {
        id: 'club',
        name: 'The Club Cut',
        description: 'Corte, lavado, masaje y styling',
        durationMin: 60,
        price: 45,
      },
      {
        id: 'ritual',
        name: 'Ritual de afeitado',
        description: 'Afeitado completo en 45 minutos',
        durationMin: 45,
        price: 38,
        onlyForMen: true,
      },
      {
        id: 'barba',
        name: 'Escultura de barba',
        description: 'Diseño con navaja y aceites',
        durationMin: 30,
        price: 26,
        onlyForMen: true,
      },
    ],
    barbers: [
      { id: 'gonzalo', name: 'Gonzalo Prieto', specialty: 'Master barber', rating: 5, years: 15 },
      { id: 'clara', name: 'Clara Ibáñez', specialty: 'Ritual de afeitado', rating: 4.9, years: 8 },
    ],
  },
  {
    id: 'corte-co',
    name: 'Peluquería Santa Cruz',
    address: 'Calle San Fernando, 24, Santa Cruz',
    city: 'Sevilla',
    lat: 37.3836,
    lng: -5.9918,
    shopType: 'mujeres',
    rating: 4.5,
    reviews: 97,
    priceLevel: 2,
    cover: cover('photo-1522337360788-8b13dee7a37e'),
    description:
      'Espacio moderno en pleno centro. Especialistas en texturas, rizos y cortes femeninos personalizados.',
    phone: '+34 954 22 11 00',
    tags: ['Rizos', 'Corte femenino', 'Moderno'],
    opensAt: '10:30',
    closesAt: '20:30',
    closedDays: [0],
    services: [
      {
        id: 'textura',
        name: 'Corte texturizado',
        description: 'Para pelo liso o con movimiento',
        durationMin: 40,
        price: 23,
      },
      {
        id: 'rizos',
        name: 'Método rizos',
        description: 'Corte en seco y definición',
        durationMin: 60,
        price: 32,
      },
      {
        id: 'color',
        name: 'Color y brillo',
        description: 'Coloración suave y tratamiento de brillo',
        durationMin: 75,
        price: 45,
      },
      {
        id: 'duo',
        name: 'Corte + hidratación',
        description: 'Corte personalizado y tratamiento reparador',
        durationMin: 65,
        price: 36,
      },
    ],
    barbers: [
      { id: 'alba', name: 'Alba Márquez', specialty: 'Rizos', rating: 4.7, years: 6 },
      { id: 'hugo', name: 'Hugo Leal', specialty: 'Texturas', rating: 4.4, years: 5 },
    ],
  },
  {
    id: 'distrito-9',
    name: 'Barbería Macarena',
    address: 'Calle Feria, 105, Macarena',
    city: 'Sevilla',
    lat: 37.3984,
    lng: -5.9912,
    shopType: 'hombres',
    rating: 4.4,
    reviews: 74,
    priceLevel: 1,
    cover: cover('photo-1621605815971-fbc98d665033'),
    description:
      'Barbería de barrio en la Macarena, fiel a los cortes de siempre y con precios de toda la vida.',
    phone: '+34 954 55 66 77',
    tags: ['Barrio', 'Económico', 'Familiar'],
    opensAt: '09:00',
    closesAt: '19:30',
    closedDays: [0],
    services: [
      {
        id: 'clasico',
        name: 'Corte de siempre',
        description: 'Máquina, tijera y peine',
        durationMin: 30,
        price: 14,
      },
      {
        id: 'barba',
        name: 'Barba',
        description: 'Recorte y perfilado',
        durationMin: 20,
        price: 9,
        onlyForMen: true,
      },
      {
        id: 'pack',
        name: 'Pack padre e hijo',
        description: 'Dos cortes seguidos',
        durationMin: 55,
        price: 22,
      },
    ],
    barbers: [
      { id: 'julian', name: 'Julián Ramos', specialty: 'Clásico', rating: 4.4, years: 22 },
      { id: 'vera', name: 'Vera Costa', specialty: 'Familia', rating: 4.6, years: 2 },
    ],
  },
  {
    id: 'peluqueria-remedios',
    name: 'Peluquería Los Remedios',
    address: 'Calle Asunción, 12, Los Remedios',
    city: 'Sevilla',
    lat: 37.3775,
    lng: -5.997,
    shopType: 'mujeres',
    rating: 4.7,
    reviews: 143,
    priceLevel: 2,
    cover: cover('photo-1562322140-8baeececf3df'),
    description:
      'Peluquería de barrio con un equipo especializado en rizos, tratamientos y color respetuoso con el cabello.',
    phone: '+34 954 28 31 42',
    tags: ['Rizos', 'Tratamientos', 'Color'],
    opensAt: '10:00',
    closesAt: '20:00',
    closedDays: [0],
    services: [
      {
        id: 'corte',
        name: 'Corte femenino',
        description: 'Corte personalizado con lavado y secado',
        durationMin: 45,
        price: 22,
      },
      {
        id: 'rizos',
        name: 'Método rizos',
        description: 'Corte en seco, definición y difusión',
        durationMin: 65,
        price: 34,
      },
      {
        id: 'tratamiento',
        name: 'Tratamiento reparador',
        description: 'Diagnóstico, mascarilla y masaje capilar',
        durationMin: 40,
        price: 28,
      },
      {
        id: 'color',
        name: 'Color completo',
        description: 'Coloración sin amoniaco y acabado personalizado',
        durationMin: 90,
        price: 48,
      },
    ],
    barbers: [
      { id: 'marta', name: 'Marta Salas', specialty: 'Rizos', rating: 4.8, years: 10 },
      { id: 'elena', name: 'Elena Ponce', specialty: 'Color', rating: 4.6, years: 7 },
      { id: 'rocio', name: 'Rocío León', specialty: 'Tratamientos', rating: 4.7, years: 5 },
    ],
  },
  {
    id: 'barberia-nervion',
    name: 'Barbería Nervión',
    address: 'Calle Luis Montoto, 48, Nervión',
    city: 'Sevilla',
    lat: 37.3885,
    lng: -5.9748,
    shopType: 'hombres',
    rating: 4.5,
    reviews: 118,
    priceLevel: 1,
    cover: cover('photo-1599351431202-1e0f0137899a'),
    description:
      'Barbería cercana y sin complicaciones, con cortes rápidos, degradados y arreglo de barba.',
    phone: '+34 954 61 72 83',
    tags: ['Barrio', 'Fade', 'Clásico'],
    opensAt: '09:30',
    closesAt: '20:00',
    closedDays: [0],
    services: [
      {
        id: 'corte',
        name: 'Corte de barrio',
        description: 'Corte a tijera y máquina',
        durationMin: 30,
        price: 16,
      },
      {
        id: 'fade',
        name: 'Degradado',
        description: 'Fade limpio con acabado personalizado',
        durationMin: 35,
        price: 21,
      },
      {
        id: 'barba',
        name: 'Recorte de barba',
        description: 'Perfilado y acabado con aceite',
        durationMin: 20,
        price: 10,
        onlyForMen: true,
      },
      {
        id: 'pack',
        name: 'Corte + barba',
        description: 'Corte y perfilado de barba',
        durationMin: 50,
        price: 26,
        onlyForMen: true,
      },
    ],
    barbers: [
      { id: 'ivan', name: 'Iván Castro', specialty: 'Fade', rating: 4.5, years: 8 },
      { id: 'diego', name: 'Diego Romero', specialty: 'Clásico', rating: 4.4, years: 5 },
      { id: 'laura', name: 'Laura Méndez', specialty: 'Barba', rating: 4.7, years: 4 },
    ],
  },
  {
    id: 'peluqueria-alameda',
    name: 'Peluquería Alameda',
    address: 'Alameda de Hércules, 30, Alameda',
    city: 'Sevilla',
    lat: 37.3978,
    lng: -5.9956,
    shopType: 'mujeres',
    rating: 4.8,
    reviews: 201,
    priceLevel: 3,
    cover: cover('photo-1595476108010-b4d1f102b1b1'),
    description:
      'Estudio de peluquería en la Alameda. Color, mechas y recogidos con un trato cercano y cita previa.',
    phone: '+34 954 90 11 22',
    tags: ['Color', 'Mechas', 'Novias'],
    opensAt: '10:00',
    closesAt: '21:00',
    closedDays: [0],
    services: [
      {
        id: 'corte',
        name: 'Corte y styling',
        description: 'Corte personalizado con lavado y peinado',
        durationMin: 50,
        price: 25,
      },
      {
        id: 'color',
        name: 'Color completo',
        description: 'Coloración personalizada y tratamiento',
        durationMin: 100,
        price: 55,
      },
      {
        id: 'mechas',
        name: 'Mechas y balayage',
        description: 'Iluminación a medida con acabado natural',
        durationMin: 120,
        price: 70,
      },
      {
        id: 'recogido',
        name: 'Recogido de novia',
        description: 'Prueba y peinado para el gran día',
        durationMin: 75,
        price: 45,
      },
    ],
    barbers: [
      { id: 'carmen', name: 'Carmen Ríos', specialty: 'Color', rating: 4.9, years: 14 },
      { id: 'paula', name: 'Paula Aranda', specialty: 'Mechas', rating: 4.8, years: 9 },
      { id: 'irene', name: 'Irene Cabrera', specialty: 'Recogidos', rating: 4.7, years: 6 },
    ],
  },
  {
    id: 'peluqueria-cartuja',
    name: 'Peluquería La Cartuja',
    address: 'Calle Marie Curie, 12, La Cartuja',
    city: 'Sevilla',
    lat: 37.3988,
    lng: -6.0103,
    shopType: 'mujeres',
    rating: 4.4,
    reviews: 89,
    priceLevel: 2,
    cover: cover('photo-1521590832167-7bcbfaa6381f'),
    description:
      'Peluquería tranquila en La Cartuja, con servicios de corte, rizos y tratamientos a precios cuidados.',
    phone: '+34 954 46 57 68',
    tags: ['Corte femenino', 'Rizos', 'Económico'],
    opensAt: '09:30',
    closesAt: '19:30',
    closedDays: [0],
    services: [
      {
        id: 'corte',
        name: 'Corte femenino',
        description: 'Corte, lavado y secado',
        durationMin: 40,
        price: 18,
      },
      {
        id: 'rizos',
        name: 'Definición de rizos',
        description: 'Corte en seco y definición',
        durationMin: 60,
        price: 30,
      },
      {
        id: 'tratamiento',
        name: 'Hidratación profunda',
        description: 'Mascarilla y masaje capilar',
        durationMin: 35,
        price: 25,
      },
      {
        id: 'color',
        name: 'Color suave',
        description: 'Coloración sin amoniaco',
        durationMin: 80,
        price: 42,
      },
    ],
    barbers: [
      { id: 'noelia', name: 'Noelia Santos', specialty: 'Corte femenino', rating: 4.4, years: 11 },
      { id: 'andrea', name: 'Andrea Gil', specialty: 'Rizos', rating: 4.5, years: 6 },
      { id: 'silvia', name: 'Silvia Naranjo', specialty: 'Color', rating: 4.3, years: 4 },
    ],
  },
]

export const findBarbershop = (id: string) => barbershops.find((shop) => shop.id === id)

export const findBarber = (shopId: string, barberId: string) =>
  findBarbershop(shopId)?.barbers.find((barber) => barber.id === barberId)

export const findService = (shopId: string, serviceId: string) =>
  findBarbershop(shopId)?.services.find((service) => service.id === serviceId)
