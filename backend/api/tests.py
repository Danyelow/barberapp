from datetime import time, timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from barbers.models import Barber, BarberShop, HaircutType, Offer
from clients.models import Client
from reservations.models import Reservation


class ApiTests(TestCase):
    def setUp(self):
        self.shop = BarberShop.objects.create(
            name='Barbería Test',
            shop_type=BarberShop.Type.UNISEX,
            opening_time=time(9, 0),
            closing_time=time(20, 0),
        )
        self.barber = Barber.objects.create_user(
            email='barbero@test.dev',
            password='clave-segura-123',
            first_name='Marta',
            last_name='Prueba',
            shop=self.shop,
        )
        self.woman = Client.objects.create_user(
            email='mujer@test.dev',
            password='clave-segura-123',
            first_name='Ana',
            last_name='Prueba',
            gender=Client.Gender.WOMAN,
        )
        self.man = Client.objects.create_user(
            email='hombre@test.dev',
            password='clave-segura-123',
            first_name='Luis',
            last_name='Prueba',
            gender=Client.Gender.MAN,
        )
        self.beard = HaircutType.objects.create(
            shop=self.shop,
            name='Barba',
            price=10,
            duration_minutes=30,
            only_for_men=True,
        )
        self.haircut = HaircutType.objects.create(
            shop=self.shop,
            name='Corte',
            price=20,
            duration_minutes=30,
        )
        self.offer = Offer.objects.create(
            shop=self.shop,
            title='20 % en tu primer corte',
            description='Válido de lunes a jueves.',
            discount_percent=20,
        )
        self.day = (timezone.localdate() + timedelta(days=2)).isoformat()

    def auth(self, email):
        response = self.client.post(
            '/api/auth/login/',
            {'email': email, 'password': 'clave-segura-123'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['token']}")
        return client

    def booking_payload(self, service, hour='10:00'):
        return {
            'barbershopId': str(self.shop.pk),
            'barberId': str(self.barber.pk),
            'serviceId': str(service.pk),
            'date': self.day,
            'time': hour,
        }

    def test_login_and_catalog(self):
        client = self.auth('mujer@test.dev')
        shops = client.get('/api/shops/')
        self.assertEqual(shops.status_code, 200)
        self.assertEqual(shops.data[0]['shopType'], 'unisex')
        self.assertEqual(shops.data[0]['barbers'][0]['name'], 'Marta Prueba')
        self.assertEqual(shops.data[0]['offer']['discountPercent'], 20)

    def test_expired_offer_is_not_exposed(self):
        Offer.objects.filter(pk=self.offer.pk).update(
            valid_until=timezone.localdate() - timedelta(days=1)
        )
        client = self.auth('mujer@test.dev')
        shops = client.get('/api/shops/')
        self.assertEqual(shops.status_code, 200)
        self.assertIsNone(shops.data[0]['offer'])

    def test_woman_cannot_book_beard(self):
        client = self.auth('mujer@test.dev')
        response = client.post('/api/bookings/', self.booking_payload(self.beard), format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('barba', response.data['detail'])

    def test_man_can_book_beard_and_barber_sees_reservation(self):
        client = self.auth('hombre@test.dev')
        response = client.post('/api/bookings/', self.booking_payload(self.beard), format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'pendiente')

        barber_client = self.auth('barbero@test.dev')
        reservations = barber_client.get('/api/bookings/')
        self.assertEqual(reservations.status_code, 200)
        self.assertEqual(len(reservations.data), 1)
        self.assertEqual(reservations.data[0]['customerName'], 'Luis Prueba')

    def test_overlapping_reservation_is_rejected(self):
        client = self.auth('hombre@test.dev')
        first = client.post('/api/bookings/', self.booking_payload(self.haircut, '10:00'), format='json')
        self.assertEqual(first.status_code, 201)
        second = client.post('/api/bookings/', self.booking_payload(self.haircut, '10:15'), format='json')
        self.assertEqual(second.status_code, 400)
        self.assertIn('ocuparse', second.data['detail'])

    def test_client_can_cancel_only_own_reservation(self):
        client = self.auth('hombre@test.dev')
        created = client.post('/api/bookings/', self.booking_payload(self.haircut), format='json')
        response = client.patch(
            f"/api/bookings/{created.data['id']}/",
            {'status': 'cancelada'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'cancelada')
        self.assertEqual(
            Reservation.objects.get(pk=created.data['id']).status,
            Reservation.Status.CANCELLED,
        )

    def test_unauthenticated_catalog_is_rejected(self):
        response = APIClient().get('/api/shops/')
        self.assertEqual(response.status_code, 401)

    def test_availability_returns_busy_duration(self):
        client = self.auth('hombre@test.dev')
        created = client.post(
            '/api/bookings/',
            self.booking_payload(self.haircut, '10:00'),
            format='json',
        )
        self.assertEqual(created.status_code, 201)

        response = client.get(
            f'/api/availability/?shop={self.shop.pk}&barber={self.barber.pk}&date={self.day}'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['busy'], [{'time': '10:00', 'durationMin': 30}])

    def test_availability_rejects_invalid_parameters(self):
        client = self.auth('hombre@test.dev')
        response = client.get(
            f'/api/availability/?shop=no-es-un-id&barber={self.barber.pk}&date={self.day}'
        )
        self.assertEqual(response.status_code, 400)
