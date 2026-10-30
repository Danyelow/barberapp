from django.contrib.auth.models import AbstractUser
from django.db import models


class BarberShop(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Barber(AbstractUser):
    shop = models.ForeignKey(
        BarberShop,
        on_delete=models.CASCADE,
        related_name='barbers',
        null=True,
        blank=True,
    )
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    speciality = models.CharField(max_length=100, blank=True)
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='barber_set',
        related_query_name='barber',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='barber_set',
        related_query_name='barber',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['username']

    def __str__(self):
        return self.get_full_name() or self.username


class HaircutType(models.Model):
    shop = models.ForeignKey(
        BarberShop,
        on_delete=models.CASCADE,
        related_name='haircut_types',
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    duration_minutes = models.PositiveIntegerField(help_text='Estimated duration in minutes')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} - {self.shop.name}'