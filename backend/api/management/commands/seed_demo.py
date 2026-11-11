from datetime import time, timedelta
from decimal import Decimal
import random
import unicodedata

from django.contrib.gis.geos import Point
from django.core.management.base import BaseCommand
from django.utils import timezone

from barbers.models import Barber, BarberShop, HaircutType, Offer
from clients.models import Client
from reservations.models import Reservation


def slugify(value):
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode()
    return '-'.join(value.lower().replace('&', 'y').split())


def cover(photo_id):
    return f'https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w=900&q=70'


SHOPS = [
    {
        'name': 'Barbería Triana',
        'shop_type': 'hombres',
        'address': 'Calle Betis, 42, Triana',
        'lat': 37.3839,
        'lng': -6.0028,
        'rating': '4.9',
        'reviews': 248,
        'price_level': 2,
        'cover': cover('photo-1503951914875-452162b0f3f1'),
        'description': 'Barbería de barrio a orillas del Guadalquivir. Cortes clásicos, afeitado a navaja y café de máquina mientras esperas.',
        'phone': '+34 954 12 34 56',
        'tags': 'Corte clásico,Afeitado a navaja,Fade',
        'opens': time(10, 0),
        'closes': time(20, 30),
        'closed_days': '0',
        'services': [
            ('Corte clásico', 'Tijera y máquina, lavado y peinado', '18', 30, False),
            ('Fade y textura', 'Degradado a máquina y acabado con textura', '25', 45, False),
            ('Afeitado a navaja', 'Toalla caliente, aceites y after-shave', '20', 30, True),
            ('Corte infantil', 'Hasta 12 años, con paciencia extra', '14', 25, False),
        ],
        'barbers': [
            ('Mateo Ruiz', 'Clásico y navaja', '4.9', 12),
            ('Andrés Vidal', 'Fade', '4.8', 7),
            ('Nuria Sanz', 'Barba y perfilado', '5.0', 5),
        ],
    },
    {
        'name': 'Barbería La Giralda',
        'shop_type': 'unisex',
        'address': 'Calle Mateos Gago, 12, Santa Cruz',
        'lat': 37.3862,
        'lng': -5.9906,
        'rating': '4.7',
        'reviews': 156,
        'price_level': 3,
        'cover': cover('photo-1585747860715-2ba37e788b70'),
        'description': 'Estudio junto a la Giralda especializado en degradados limpios, texturizados y color. Reserva con antelación, se llena rápido.',
        'phone': '+34 954 77 88 99',
        'tags': 'Fade,Color,Diseño',
        'opens': time(11, 0),
        'closes': time(21, 0),
        'closed_days': '0,1',
        'services': [
            ('Giralda Signature', 'Corte a medida con lavado y styling', '28', 45, False),
            ('Skin fade', 'Degradado a piel con acabado a navaja', '24', 40, False),
            ('Color / platinado', 'Decoloración y tono personalizado', '55', 90, False),
            ('Arreglo de barba', 'Diseño y perfilado con toalla caliente', '16', 25, True),
            ('Corte femenino', 'Corte, lavado y secado para todo tipo de cabello', '30', 45, False),
        ],
        'barbers': [
            ('Lucas Vega', 'Skin fade', '4.8', 9),
            ('Inés Ferrer', 'Color y textura', '4.7', 6),
        ],
    },
    {
        'name': 'Peluquería La Torre del Oro',
        'shop_type': 'mujeres',
        'address': 'Paseo de Colón, 8, El Arenal',
        'lat': 37.3828,
        'lng': -5.9971,
        'rating': '4.6',
        'reviews': 312,
        'price_level': 2,
        'cover': cover('photo-1560066984-138dadb4c035'),
        'description': 'Peluquería luminosa junto al río, especializada en cortes femeninos, color y peinados para eventos.',
        'phone': '+34 954 45 67 89',
        'tags': 'Corte femenino,Mechas,Peinados',
        'opens': time(9, 30),
        'closes': time(20, 0),
        'closed_days': '0',
        'services': [
            ('Corte y peinado', 'Corte, lavado y secado con acabado natural', '20', 40, False),
            ('Corte + tratamiento', 'Corte personalizado, mascarilla y peinado', '35', 60, False),
            ('Color y mechas', 'Coloración completa o mechas con diagnóstico previo', '48', 90, False),
            ('Recogido de invitada', 'Peinado de fiesta o boda con fijación duradera', '32', 50, False),
        ],
        'barbers': [
            ('Paco Delgado', 'Corte y color', '4.6', 20),
            ('Raúl Moreno', 'Peinados', '4.5', 4),
            ('Sara Ortiz', 'Corte femenino', '4.8', 8),
        ],
    },
    {
        'name': 'Barbería El Arenal',
        'shop_type': 'hombres',
        'address': 'Calle Adriano, 21, El Arenal',
        'lat': 37.3852,
        'lng': -5.9973,
        'rating': '4.8',
        'reviews': 189,
        'price_level': 3,
        'cover': cover('photo-1517832606299-7ae9b720a186'),
        'description': 'Club de barbería cerca de la Maestranza. Reserva por franjas, trato cuidado y servicio de guante blanco.',
        'phone': '+34 954 33 44 55',
        'tags': 'Premium,Club,Navaja',
        'opens': time(10, 0),
        'closes': time(20, 0),
        'closed_days': '0',
        'services': [
            ('The Club Cut', 'Corte, lavado, masaje y styling', '45', 60, False),
            ('Ritual de afeitado', 'Afeitado completo en 45 minutos', '38', 45, True),
            ('Escultura de barba', 'Diseño con navaja y aceites', '26', 30, True),
        ],
        'barbers': [
            ('Gonzalo Prieto', 'Master barber', '5.0', 15),
            ('Clara Ibáñez', 'Ritual de afeitado', '4.9', 8),
        ],
    },
    {
        'name': 'Peluquería Santa Cruz',
        'shop_type': 'unisex',
        'address': 'Calle San Fernando, 24, Santa Cruz',
        'lat': 37.3836,
        'lng': -5.9918,
        'rating': '4.5',
        'reviews': 97,
        'price_level': 2,
        'cover': cover('photo-1522337360788-8b13dee7a37e'),
        'description': 'Espacio moderno en pleno centro. Especialistas en texturas, rizos y cortes personalizados para todos.',
        'phone': '+34 954 22 11 00',
        'tags': 'Rizos,Corte,Moderno',
        'opens': time(10, 30),
        'closes': time(20, 30),
        'closed_days': '0',
        'services': [
            ('Corte texturizado', 'Para pelo liso o con movimiento', '23', 40, False),
            ('Método rizos', 'Corte en seco y definición', '32', 60, False),
            ('Color y brillo', 'Coloración suave y tratamiento de brillo', '45', 75, False),
            ('Corte + hidratación', 'Corte personalizado y tratamiento reparador', '36', 65, False),
            ('Corte masculino', 'Corte a tijera y máquina con acabado natural', '20', 30, False),
        ],
        'barbers': [
            ('Alba Márquez', 'Rizos', '4.7', 6),
            ('Hugo Leal', 'Texturas', '4.4', 5),
        ],
    },
    {
        'name': 'Barbería Macarena',
        'shop_type': 'hombres',
        'address': 'Calle Feria, 105, Macarena',
        'lat': 37.3984,
        'lng': -5.9912,
        'rating': '4.4',
        'reviews': 74,
        'price_level': 1,
        'cover': cover('photo-1621605815971-fbc98d665033'),
        'description': 'Barbería de barrio en la Macarena, fiel a los cortes de siempre y con precios de toda la vida.',
        'phone': '+34 954 55 66 77',
        'tags': 'Barrio,Económico,Familiar',
        'opens': time(9, 0),
        'closes': time(19, 30),
        'closed_days': '0',
        'services': [
            ('Corte de siempre', 'Máquina, tijera y peine', '14', 30, False),
            ('Barba', 'Recorte y perfilado', '9', 20, True),
            ('Pack padre e hijo', 'Dos cortes seguidos', '22', 55, False),
        ],
        'barbers': [
            ('Julián Ramos', 'Clásico', '4.4', 22),
            ('Vera Costa', 'Familia', '4.6', 2),
        ],
    },
    {
        'name': 'Peluquería Los Remedios',
        'shop_type': 'mujeres',
        'address': 'Calle Asunción, 12, Los Remedios',
        'lat': 37.3775,
        'lng': -5.9970,
        'rating': '4.7',
        'reviews': 143,
        'price_level': 2,
        'cover': cover('photo-1562322140-8baeececf3df'),
        'description': 'Peluquería de barrio con un equipo especializado en rizos, tratamientos y color respetuoso con el cabello.',
        'phone': '+34 954 28 31 42',
        'tags': 'Rizos,Tratamientos,Color',
        'opens': time(10, 0),
        'closes': time(20, 0),
        'closed_days': '0',
        'services': [
            ('Corte femenino', 'Corte personalizado con lavado y secado', '22', 45, False),
            ('Método rizos', 'Corte en seco, definición y difusión', '34', 65, False),
            ('Tratamiento reparador', 'Diagnóstico, mascarilla y masaje capilar', '28', 40, False),
            ('Color completo', 'Coloración sin amoniaco y acabado personalizado', '48', 90, False),
        ],
        'barbers': [
            ('Marta Salas', 'Rizos', '4.8', 10),
            ('Elena Ponce', 'Color', '4.6', 7),
            ('Rocío León', 'Tratamientos', '4.7', 5),
        ],
    },
    {
        'name': 'Barbería Nervión',
        'shop_type': 'hombres',
        'address': 'Calle Luis Montoto, 48, Nervión',
        'lat': 37.3885,
        'lng': -5.9748,
        'rating': '4.5',
        'reviews': 118,
        'price_level': 1,
        'cover': cover('photo-1599351431202-1e0f0137899a'),
        'description': 'Barbería cercana y sin complicaciones, con cortes rápidos, degradados y arreglo de barba.',
        'phone': '+34 954 61 72 83',
        'tags': 'Barrio,Fade,Clásico',
        'opens': time(9, 30),
        'closes': time(20, 0),
        'closed_days': '0',
        'services': [
            ('Corte de barrio', 'Corte a tijera y máquina', '16', 30, False),
            ('Degradado', 'Fade limpio con acabado personalizado', '21', 35, False),
            ('Recorte de barba', 'Perfilado y acabado con aceite', '10', 20, True),
            ('Corte + barba', 'Corte y perfilado de barba', '26', 50, True),
        ],
        'barbers': [
            ('Iván Castro', 'Fade', '4.5', 8),
            ('Diego Romero', 'Clásico', '4.4', 5),
            ('Laura Méndez', 'Barba', '4.7', 4),
        ],
    },
    {
        'name': 'Peluquería Alameda',
        'shop_type': 'mujeres',
        'address': 'Alameda de Hércules, 30, Alameda',
        'lat': 37.3978,
        'lng': -5.9956,
        'rating': '4.8',
        'reviews': 201,
        'price_level': 3,
        'cover': cover('photo-1595476108010-b4d1f102b1b1'),
        'description': 'Estudio de peluquería en la Alameda. Color, mechas y recogidos con un trato cercano y cita previa.',
        'phone': '+34 954 90 11 22',
        'tags': 'Color,Mechas,Novias',
        'opens': time(10, 0),
        'closes': time(21, 0),
        'closed_days': '0',
        'services': [
            ('Corte y styling', 'Corte personalizado con lavado y peinado', '25', 50, False),
            ('Color completo', 'Coloración personalizada y tratamiento', '55', 100, False),
            ('Mechas y balayage', 'Iluminación a medida con acabado natural', '70', 120, False),
            ('Recogido de novia', 'Prueba y peinado para el gran día', '45', 75, False),
        ],
        'barbers': [
            ('Carmen Ríos', 'Color', '4.9', 14),
            ('Paula Aranda', 'Mechas', '4.8', 9),
            ('Irene Cabrera', 'Recogidos', '4.7', 6),
        ],
    },
    {
        'name': 'Peluquería La Cartuja',
        'shop_type': 'mujeres',
        'address': 'Calle Marie Curie, 12, La Cartuja',
        'lat': 37.3988,
        'lng': -6.0103,
        'rating': '4.4',
        'reviews': 89,
        'price_level': 2,
        'cover': cover('photo-1521590832167-7bcbfaa6381f'),
        'description': 'Peluquería tranquila en La Cartuja, con servicios de corte, rizos y tratamientos a precios cuidados.',
        'phone': '+34 954 46 57 68',
        'tags': 'Corte femenino,Rizos,Económico',
        'opens': time(9, 30),
        'closes': time(19, 30),
        'closed_days': '0',
        'services': [
            ('Corte femenino', 'Corte, lavado y secado', '18', 40, False),
            ('Definición de rizos', 'Corte en seco y definición', '30', 60, False),
            ('Hidratación profunda', 'Mascarilla y masaje capilar', '25', 35, False),
            ('Color suave', 'Coloración sin amoniaco', '42', 80, False),
        ],
        'barbers': [
            ('Noelia Santos', 'Corte femenino', '4.4', 11),
            ('Andrea Gil', 'Rizos', '4.5', 6),
            ('Silvia Naranjo', 'Color', '4.3', 4),
        ],
    },
]


# Plantillas por tipo de peluquería. El seed elige algunas al azar (con una
# semilla fija para que el resultado sea reproducible) y las guarda en la BD.
OFFER_TEMPLATES = {
    'hombres': [
        ('20 % en tu primer corte', 'Descuento válido de lunes a jueves. Preséntalo al llegar.', 20),
        ('15 % en degradados', 'Incluye lavado y acabado. No acumulable con otras promociones.', 15),
        ('10 % en corte y lavado', 'Reserva el corte con lavado y ahorra en el total.', 10),
    ],
    'mujeres': [
        ('20 % en tu primer corte', 'Descuento válido de martes a jueves con cita previa.', 20),
        ('15 % en color o mechas', 'Incluye diagnóstico previo del cabello. Sujeto a disponibilidad.', 15),
        ('10 % en tratamientos', 'Hidratación o reparación capilar. No acumulable con otras ofertas.', 10),
    ],
    'unisex': [
        ('15 % en cualquier corte', 'Válido para nuevos clientes de lunes a jueves.', 15),
        ('20 % en color', 'Incluye lavado y peinado final. Con cita previa.', 20),
        ('10 % en tu primera visita', 'Muéstralo al llegar a la peluquería.', 10),
    ],
}


class Command(BaseCommand):
    help = 'Crea las peluquerías, servicios, profesionales, ofertas y cuentas de demostración de Sevilla.'

    def handle(self, *args, **options):
        shops_created = 0
        services_created = 0
        barbers_created = 0
        offers_created = 0

        for index, item in enumerate(SHOPS):
            shop, created = BarberShop.objects.update_or_create(
                name=item['name'],
                defaults={
                    'shop_type': item['shop_type'],
                    'city': 'Sevilla',
                    'address': item['address'],
                    'phone': item['phone'],
                    'description': item['description'],
                    'location': Point(item['lng'], item['lat'], srid=4326),
                    'opening_time': item['opens'],
                    'closing_time': item['closes'],
                    'closed_days': item['closed_days'],
                    'cover_url': item['cover'],
                    'rating': Decimal(item['rating']),
                    'reviews': item['reviews'],
                    'price_level': item['price_level'],
                    'tags': item['tags'],
                },
            )
            shops_created += int(created)

            for service_name, description, price, duration, only_for_men in item['services']:
                _, service_created = HaircutType.objects.update_or_create(
                    shop=shop,
                    name=service_name,
                    defaults={
                        'description': description,
                        'price': Decimal(price),
                        'duration_minutes': duration,
                        'only_for_men': only_for_men,
                    },
                )
                services_created += int(service_created)

            for barber_name, speciality, rating, years in item['barbers']:
                demo = index == 0 and barber_name == 'Mateo Ruiz'
                email = 'barbero@barberapp.dev' if demo else (
                    f'{slugify(barber_name)}.{slugify(item["name"])}@barberapp.dev'
                )
                parts = barber_name.split()
                barber, barber_created = Barber.objects.update_or_create(
                    email=email,
                    defaults={
                        'username': email,
                        'first_name': parts[0],
                        'last_name': ' '.join(parts[1:]),
                        'shop': shop,
                        'phone': '',
                        'bio': f'Profesional de {item["name"]}.',
                        'speciality': speciality,
                        'rating': Decimal(rating),
                        'years_experience': years,
                        'is_active': True,
                    },
                )
                if barber_created:
                    barber.set_unusable_password()
                    barber.save(update_fields=['password'])
                if demo:
                    barber.set_password('123456')
                    barber.save(update_fields=['password'])
                barbers_created += int(barber_created)

        # Solo se generan ofertas la primera vez. Así, si el administrador las
        # cambia o las desactiva, volver a ejecutar seed_demo no las pisa.
        if not Offer.objects.exists():
            rng = random.Random(20261111)
            demo_shops = list(
                BarberShop.objects.filter(name__in=[item['name'] for item in SHOPS])
            )
            for shop in rng.sample(demo_shops, min(4, len(demo_shops))):
                title, description, discount = rng.choice(OFFER_TEMPLATES[shop.shop_type])
                Offer.objects.create(
                    shop=shop,
                    title=title,
                    description=description,
                    discount_percent=discount,
                    valid_until=timezone.localdate() + timedelta(days=rng.randint(30, 60)),
                )
                offers_created += 1

        demo_client, _ = Client.objects.update_or_create(
            email='cliente@barberapp.dev',
            defaults={
                'username': 'cliente@barberapp.dev',
                'first_name': 'Lucía',
                'last_name': 'Gómez',
                'phone': '+34 600 111 222',
                'gender': Client.Gender.WOMAN,
                'is_active': True,
            },
        )
        demo_client.set_password('123456')
        demo_client.save(update_fields=['password'])

        demo_barber = Barber.objects.get(email='barbero@barberapp.dev')
        shop = demo_barber.shop
        service = HaircutType.objects.get(shop=shop, name='Fade y textura')
        service_two = HaircutType.objects.get(shop=shop, name='Corte clásico')
        today = timezone.localdate()

        reservations = [
            (today + timedelta(days=1), time(17, 0), service, Reservation.Status.CONFIRMED),
            (today + timedelta(days=3), time(11, 30), service_two, Reservation.Status.PENDING),
        ]
        reservations_created = 0
        for day, hour, haircut, status_value in reservations:
            _, created = Reservation.objects.get_or_create(
                client=demo_client,
                barber=demo_barber,
                date=day,
                time=hour,
                defaults={
                    'shop': shop,
                    'haircut_type': haircut,
                    'status': status_value,
                    'notes': 'Reserva de demostración.',
                },
            )
            reservations_created += int(created)

        self.stdout.write(
            self.style.SUCCESS(
                'Datos de demo listos: '
                f'{BarberShop.objects.count()} peluquerías, '
                f'{HaircutType.objects.count()} servicios, '
                f'{Offer.objects.count()} ofertas, '
                f'{Barber.objects.count()} profesionales, '
                f'{Reservation.objects.count()} reservas. '
                f'Nuevos: {shops_created} peluquerías, {services_created} servicios, '
                f'{offers_created} ofertas, {barbers_created} profesionales, '
                f'{reservations_created} reservas.'
            )
        )
        self.stdout.write('Cliente demo: cliente@barberapp.dev / 123456')
        self.stdout.write('Barbero demo: barbero@barberapp.dev / 123456')
