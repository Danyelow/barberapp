from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Client


@admin.register(Client)
class ClientAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Datos de cliente', {'fields': ('phone', 'gender', 'preferred_barber', 'notes')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            'Datos de cliente',
            {
                'classes': ('wide',),
                'fields': ('first_name', 'last_name', 'email', 'phone', 'gender'),
            },
        ),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'gender', 'phone')
    list_filter = UserAdmin.list_filter + ('gender',)
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone')
