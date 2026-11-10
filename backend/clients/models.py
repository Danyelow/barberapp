from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class EmailUserManager(BaseUserManager):
    """Permite crear clientes usando el email como identificador principal."""

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


class Client(AbstractUser):
    objects = EmailUserManager()

    class Gender(models.TextChoices):
        WOMAN = 'mujer', 'Mujer'
        MAN = 'hombre', 'Hombre'
        NON_BINARY = 'no_binario', 'No binario'
        UNDISCLOSED = 'prefiero_no_decir', 'Prefiero no decirlo'

    username = models.CharField(
        'usuario',
        max_length=150,
        unique=True,
        blank=True,
        help_text='Si lo dejas vacío se usará el email. Solo es un identificador interno.',
    )
    email = models.EmailField('email (para entrar)', unique=True)
    phone = models.CharField('teléfono', max_length=20, blank=True)
    gender = models.CharField(
        'género',
        max_length=20,
        choices=Gender.choices,
        blank=True,
        help_text='Género autodeclarado. Solo los hombres ven los servicios de barba.',
    )
    preferred_barber = models.ForeignKey(
        'barbers.Barber',
        on_delete=models.SET_NULL,
        related_name='preferred_clients',
        null=True,
        blank=True,
        verbose_name='barbero/a preferido',
    )
    notes = models.TextField('notas', blank=True)
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
    created_at = models.DateTimeField('creado', auto_now_add=True)
    updated_at = models.DateTimeField('actualizado', auto_now=True)

    class Meta:
        ordering = ['username']
        verbose_name = 'cliente'
        verbose_name_plural = 'clientes'

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_full_name() or self.username
