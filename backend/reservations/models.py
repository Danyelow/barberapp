from django.db import models


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.CASCADE,
        related_name='reservations',
    )
    barber = models.ForeignKey(
        'barbers.Barber',
        on_delete=models.CASCADE,
        related_name='reservations',
    )
    shop = models.ForeignKey(
        'barbers.BarberShop',
        on_delete=models.CASCADE,
        related_name='reservations',
    )
    haircut_type = models.ForeignKey(
        'barbers.HaircutType',
        on_delete=models.SET_NULL,
        related_name='reservations',
        null=True,
        blank=True,
    )
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']
        constraints = [
            models.UniqueConstraint(
                fields=['barber', 'date', 'time'],
                name='unique_barber_date_time',
            ),
        ]

    def __str__(self):
        return f'{self.client} - {self.barber} - {self.date} {self.time}'