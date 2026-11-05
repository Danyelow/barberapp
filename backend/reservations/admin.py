from django.contrib import admin

from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('client', 'barber', 'shop', 'date', 'time', 'status')
    list_filter = ('status', 'shop', 'date')
    search_fields = ('client__username', 'barber__username', 'shop__name')
    date_hierarchy = 'date'
