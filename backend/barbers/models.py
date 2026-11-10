from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class EmailUserManager(BaseUserManager):
    """Permite crear barberos/as usando el email como identificador principal."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio.')
        email = self.normalize_email(email).lower()
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class BarberShop(models.Model):
    class Type(models.TextChoices):
        MEN = 'hombres', 'Peluquería de hombres'
        WOMEN = 'mujeres', 'Peluquería de mujeres'
        UNISEX = 'unisex', 'Peluquería unisex'

    class PriceLevel(models.IntegerChoices):
        BUDGET = 1, 'Económica'
        MID = 2, 'Precio medio'
        PREMIUM = 3, 'Premium'

    name = models.CharField('nombre', max_length=100)
    shop_type = models.CharField(
        'tipo de peluquería',
        max_length=10,
        choices=Type.choices,
        default=Type.MEN,
        help_text='Hombres, mujeres o unisex. Se usa para filtrar el catálogo.',
    )
    city = models.CharField('ciudad', max_length=80, default='Sevilla')
    address = models.CharField('dirección', max_length=255, blank=True)
    phone = models.CharField('teléfono', max_length=20, blank=True)
    email = models.EmailField('email', blank=True)
    description = models.TextField('descripción', blank=True)
    location = models.PointField(
        'ubicación',
        srid=4326,
        null=True,
        blank=True,
        help_text='Punto GPS en WGS84. Puedes moverlo en el mapa del formulario.',
    )
    opening_time = models.TimeField('hora de apertura', null=True, blank=True)
    closing_time = models.TimeField('hora de cierre', null=True, blank=True)
    closed_days = models.CharField(
        'días cerrados',
        max_length=20,
        blank=True,
        help_text='Números separados por comas: 0=domingo, 1=lunes… 6=sábado.',
    )

    cover_url = models.URLField(
        'imagen de portada',
        blank=True,
        max_length=500,
        help_text='URL pública de una imagen (Unsplash, Wikimedia…).',
    )
    rating = models.DecimalField(
        'valoración',
        max_digits=2,
        decimal_places=1,
        default=4.5,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    reviews = models.PositiveIntegerField('número de reseñas', default=0)
    price_level = models.PositiveSmallIntegerField(
        'nivel de precio',
        choices=PriceLevel.choices,
        default=PriceLevel.MID,
    )
    tags = models.CharField(
        'etiquetas',
        max_length=255,
        blank=True,
        help_text='Separadas por comas. Ej.: Fade, Color, Navaja.',
    )
    created_at = models.DateTimeField('creada', auto_now_add=True)
    updated_at = models.DateTimeField('actualizada', auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'peluquería'
        verbose_name_plural = 'peluquerías'

    def __str__(self):
        return self.name

    @property
    def tag_list(self):
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]

    @property
    def closed_day_list(self):
        days = []
        for value in self.closed_days.split(','):
            try:
                day = int(value.strip())
            except (TypeError, ValueError):
                continue
            if 0 <= day <= 6 and day not in days:
                days.append(day)
        return days


class Barber(AbstractUser):
    objects = EmailUserManager()

    username = models.CharField(
        'usuario',
        max_length=150,
        unique=True,
        blank=True,
        help_text='Si lo dejas vacío se usará el email. Solo es un identificador interno.',
    )
    email = models.EmailField('email (para entrar)', unique=True)
    shop = models.ForeignKey(
        BarberShop,
        on_delete=models.CASCADE,
        related_name='barbers',
        null=True,
        blank=True,
        verbose_name='peluquería',
    )
    phone = models.CharField('teléfono', max_length=20, blank=True)
    bio = models.TextField('biografía', blank=True)
    speciality = models.CharField('especialidad', max_length=100, blank=True)
    rating = models.DecimalField(
        'valoración',
        max_digits=2,
        decimal_places=1,
        default=4.5,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    years_experience = models.PositiveSmallIntegerField('años de experiencia', default=1)
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
    created_at = models.DateTimeField('creado', auto_now_add=True)
    updated_at = models.DateTimeField('actualizado', auto_now=True)

    class Meta:
        ordering = ['username']
        verbose_name = 'barbero/a'
        verbose_name_plural = 'barberos/as'

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_full_name() or self.username


class HaircutType(models.Model):
    shop = models.ForeignKey(
        BarberShop,
        on_delete=models.CASCADE,
        related_name='haircut_types',
        verbose_name='peluquería',
    )
    name = models.CharField('nombre', max_length=100)
    description = models.TextField('descripción', blank=True)
    price = models.DecimalField('precio (€)', max_digits=6, decimal_places=2)
    duration_minutes = models.PositiveIntegerField('duración (minutos)')
    only_for_men = models.BooleanField(
        'solo para hombres (barba)',
        default=False,
        help_text='Marca los arreglos o afeitados de barba. Las clientas no los verán.',
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'servicio'
        verbose_name_plural = 'servicios'

    def __str__(self):
        return f'{self.name} · {self.shop.name}'
