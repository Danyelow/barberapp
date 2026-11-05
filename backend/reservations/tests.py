from datetime import date, time

from django.core.exceptions import ValidationError
from django.test import TestCase

from barbers.models import Barber, BarberShop, HaircutType
from clients.models import Client
from reservations.models import Reservation


class ReservationGenderRuleTests(TestCase):
    """Los servicios de barba solo pueden reservarse si el cliente es hombre."""

    def setUp(self):
        self.shop = BarberShop.objects.create(name='Barbería de prueba')
        self.barber = Barber.objects.create_user(username='barbero-prueba')
        self.woman = Client.objects.create_user(
            username='clienta-prueba',
            gender=Client.Gender.WOMAN,
        )
        self.man = Client.objects.create_user(
            username='cliente-prueba',
            gender=Client.Gender.MAN,
        )
        self.beard_shave = HaircutType.objects.create(
            shop=self.shop,
            name='Afeitado de barba',
            price=20,
            duration_minutes=30,
            only_for_men=True,
        )
        self.haircut = HaircutType.objects.create(
            shop=self.shop,
            name='Corte de pelo',
            price=15,
            duration_minutes=30,
        )

    def reservation(self, client, haircut):
        return Reservation(
            client=client,
            barber=self.barber,
            shop=self.shop,
            haircut_type=haircut,
            date=date(2026, 11, 10),
            time=time(10, 0),
        )

    def test_man_can_book_beard_shave(self):
        self.reservation(self.man, self.beard_shave).full_clean()

    def test_woman_cannot_book_beard_shave(self):
        with self.assertRaises(ValidationError):
            self.reservation(self.woman, self.beard_shave).full_clean()

    def test_man_can_book_a_regular_haircut(self):
        self.reservation(self.man, self.haircut).full_clean()

    def test_woman_can_book_a_regular_haircut(self):
        self.reservation(self.woman, self.haircut).full_clean()
