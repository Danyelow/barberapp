from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Client


@admin.register(Client)
class ClientAdmin(UserAdmin):
    list_display = ('display_name', 'email', 'gender', 'phone', 'is_active')
    list_filter = ('gender', 'is_active')
    search_fields = ('first_name', 'last_name', 'email', 'phone')
    list_per_page = 25
    save_on_top = True
    ordering = ('first_name', 'last_name', 'email')
    fieldsets = (
        (
            'Acceso',
            {
                'fields': ('email', 'password'),
                'description': (
                    'El email es el usuario con el que entrará en la app. '
                    'Aquí también puedes cambiar su contraseña.'
                ),
            },
        ),
        (
            'Datos personales',
            {'fields': ('first_name', 'last_name', 'phone', 'gender')},
        ),
        (
            'Preferencias',
            {'fields': ('preferred_barber', 'notes')},
        ),
        (
            'Estado',
            {'fields': ('is_active', 'last_login', 'date_joined', 'created_at', 'updated_at')},
        ),
    )
    add_fieldsets = (
        (
            'Nuevo cliente',
            {
                'classes': ('wide',),
                'fields': (
                    'email',
                    'password1',
                    'password2',
                    'first_name',
                    'last_name',
                    'phone',
                    'gender',
                ),
                'description': (
                    'Crea la cuenta con un email y una contraseña. '
                    'La persona entrará en la app con esos datos.'
                ),
            },
        ),
    )
    readonly_fields = ('created_at', 'updated_at')

    @admin.display(description='Nombre')
    def display_name(self, obj):
        return obj.get_full_name() or obj.username
