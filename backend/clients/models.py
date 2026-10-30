from django.contrib.auth.models import AbstractUser
from django.db import models


class Client(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    preferred_barber = models.ForeignKey(
        'barbers.Barber',
        on_delete=models.SET_NULL,
        related_name='preferred_clients',
        null=True,
        blank=True,
    )
    notes = models.TextField(blank=True)
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='client_set',
        related_query_name='client',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='client_set',
        related_query_name='client',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['username']

    def __str__(self):
        return self.get_full_name() or self.username