from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.gis.admin import GISModelAdmin

from .models import Barber, BarberShop, HaircutType


class HaircutTypeInline(admin.TabularInline):
    model = HaircutType
    extra = 1
    fields = ('name', 'description', 'price', 'duration_minutes', 'only_for_men')
    verbose_name_plural = 'Servicios de la peluquería'


@admin.register(BarberShop)
class BarberShopAdmin(GISModelAdmin):
    list_display = ('name', 'shop_type', 'city', 'address', 'opening_time', 'closing_time')
    list_filter = ('shop_type', 'city', 'price_level')
    search_fields = ('name', 'address', 'city', 'tags')
    list_per_page = 20
    save_on_top = True
    readonly_fields = ('created_at', 'updated_at')
    inlines = [HaircutTypeInline]
    fieldsets = (
        (
            'Datos de la peluquería',
            {
                'fields': (
                    'name',
                    'shop_type',
                    'city',
                    'address',
                    'phone',
                    'email',
                )
            },
        ),
        (
            'Ficha pública',
            {
                'fields': (
                    'description',
                    'cover_url',
                    'rating',
                    'reviews',
                    'price_level',
                    'tags',
                ),
                'description': 'Estos datos son los que verá el cliente en la app.',
            },
        ),
        (
            'Horario',
            {
                'fields': ('opening_time', 'closing_time', 'closed_days'),
                'description': 'Días cerrados: 0=domingo, 1=lunes… 6=sábado. Sepáralos con comas.',
            },
        ),
        (
            'Mapa',
            {
                'fields': ('location',),
                'description': 'Haz clic en el mapa de Sevilla para colocar la peluquería.',
            },
        ),
        ('Auditoría', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    # Mapa OpenLayers centrado en Sevilla; no necesita API key.
    gis_widget_kwargs = {
        'attrs': {
            'default_lon': -5.9845,
            'default_lat': 37.3891,
            'default_zoom': 12,
        }
    }


@admin.register(Barber)
class BarberAdmin(UserAdmin):
    list_display = ('display_name', 'email', 'shop', 'speciality', 'is_active')
    list_filter = ('shop', 'is_active')
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'shop__name')
    list_select_related = ('shop',)
    list_per_page = 20
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
            {'fields': ('first_name', 'last_name', 'phone', 'bio')},
        ),
        (
            'Trabajo',
            {'fields': ('shop', 'speciality', 'rating', 'years_experience', 'is_active')},
        ),
        (
            'Fechas',
            {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'), 'classes': ('collapse',)},
        ),
    )
    add_fieldsets = (
        (
            'Nuevo barbero/a',
            {
                'classes': ('wide',),
                'fields': (
                    'email',
                    'password1',
                    'password2',
                    'first_name',
                    'last_name',
                    'phone',
                    'shop',
                    'speciality',
                    'rating',
                    'years_experience',
                    'is_active',
                ),
                'description': (
                    'Crea la cuenta con un email y una contraseña. '
                    'Después podrá entrar en la app con esos datos.'
                ),
            },
        ),
    )
    readonly_fields = ('created_at', 'updated_at')

    @admin.display(description='Nombre')
    def display_name(self, obj):
        return obj.get_full_name() or obj.username


@admin.register(HaircutType)
class HaircutTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'shop', 'price', 'duration_minutes', 'only_for_men')
    list_filter = ('shop', 'only_for_men')
    search_fields = ('name', 'shop__name')
    list_select_related = ('shop',)
    list_per_page = 30
    autocomplete_fields = ('shop',)


admin.site.site_header = 'BarberApp · Administración'
admin.site.site_title = 'BarberApp'
admin.site.index_title = 'Peluquerías, servicios, profesionales y reservas'
admin.site.empty_value_display = '—'
