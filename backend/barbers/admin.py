from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin

from .models import Barber, BarberShop, HaircutType


class HaircutTypeInline(admin.TabularInline):
    model = HaircutType
    extra = 0
    fields = ('name', 'price', 'duration_minutes', 'only_for_men')


@admin.register(BarberShop)
class BarberShopAdmin(GISModelAdmin):
    list_display = ('name', 'shop_type', 'address', 'phone', 'opening_time', 'closing_time')
    list_filter = ('shop_type',)
    search_fields = ('name', 'address')
    inlines = [HaircutTypeInline]
    # Mapa OpenLayers centrado en Sevilla; no necesita API key.
    gis_widget_kwargs = {
        'attrs': {
            'default_lon': -5.9845,
            'default_lat': 37.3891,
            'default_zoom': 12,
        }
    }


@admin.register(Barber)
class BarberAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'shop', 'speciality')
    list_filter = ('shop',)
    search_fields = ('username', 'first_name', 'last_name', 'email')


@admin.register(HaircutType)
class HaircutTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'shop', 'price', 'duration_minutes', 'only_for_men')
    list_filter = ('shop', 'only_for_men')
    search_fields = ('name', 'shop__name')
