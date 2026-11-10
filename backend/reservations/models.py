from django.core.exceptions import ValidationError
from django.db import models


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pendiente'
        CONFIRMED = 'confirmed', 'Confirmada'
        COMPLETED = 'completed', 'Completada'
        CANCELLED = 'cancelled', 'Cancelada'

    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name='cliente',
    )
    barber = models.ForeignKey(
        'barbers.Barber',
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name='barbero/a',
    )
    shop = models.ForeignKey(
        'barbers.BarberShop',
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name='peluquería',
    )
    haircut_type = models.ForeignKey(
        'barbers.HaircutType',
        on_delete=models.SET_NULL,
        related_name='reservations',
        null=True,
        blank=True,
        verbose_name='servicio',
    )
    date = models.DateField('fecha')
    time = models.TimeField('hora')
    status = models.CharField(
        'estado',
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField('notas', blank=True)
    created_at = models.DateTimeField('creada', auto_now_add=True)
    updated_at = models.DateTimeField('actualizada', auto_now=True)

    class Meta:
        ordering = ['date', 'time']
        verbose_name = 'reserva'
        verbose_name_plural = 'reservas'
        constraints = [
            models.UniqueConstraint(
                fields=['barber', 'date', 'time'],
                name='unique_barber_date_time',
            ),
        ]

    def __str__(self):
        return f'{self.client} · {self.barber} · {self.date} {self.time}'

    def clean(self):
        super().clean()

        if self.barber_id and self.shop_id and self.barber.shop_id != self.shop_id:
            raise ValidationError({'barber': 'El barbero o barbera no pertenece a esta peluquería.'})

        if self.haircut_type_id and self.shop_id and self.haircut_type.shop_id != self.shop_id:
            raise ValidationError({'haircut_type': 'El servicio no pertenece a esta peluquería.'})

        if (
            self.haircut_type_id
            and self.haircut_type.only_for_men
            and self.client_id
            and self.client.gender != 'hombre'
        ):
            raise ValidationError(
                {'haircut_type': 'Los servicios de barba solo están disponibles para clientes hombres.'}
            )

        if (
            self.status == self.Status.CANCELLED
            or not self.barber_id
            or not self.date
            or not self.time
        ):
            return

        duration = (
            self.haircut_type.duration_minutes
            if self.haircut_type_id
            else 30
        )
        start = self.time.hour * 60 + self.time.minute
        end = start + duration
        others = (
            Reservation.objects.filter(barber_id=self.barber_id, date=self.date)
            .exclude(pk=self.pk)
            .exclude(status=self.Status.CANCELLED)
            .select_related('haircut_type')
        )
        for item in others:
            item_duration = item.haircut_type.duration_minutes if item.haircut_type_id else 30
            item_start = item.time.hour * 60 + item.time.minute
            if start < item_start + item_duration and item_start < end:
                raise ValidationError(
                    {'time': 'Ese horario se solapa con otra reserva del mismo profesional.'}
                )
