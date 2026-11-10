from django.contrib import admin

from .models import Reservation


@admin.action(description='Confirmar reservas seleccionadas')
def mark_confirmed(modeladmin, request, queryset):
    queryset.update(status=Reservation.Status.CONFIRMED)


@admin.action(description='Marcar reservas como completadas')
def mark_completed(modeladmin, request, queryset):
    queryset.update(status=Reservation.Status.COMPLETED)


@admin.action(description='Cancelar reservas seleccionadas')
def mark_cancelled(modeladmin, request, queryset):
    queryset.update(status=Reservation.Status.CANCELLED)


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('date', 'time', 'client', 'barber', 'shop', 'status')
    list_filter = ('status', 'date', 'shop')
    search_fields = (
        'client__first_name',
        'client__last_name',
        'client__email',
        'barber__first_name',
        'barber__last_name',
        'shop__name',
    )
    date_hierarchy = 'date'
    list_editable = ('status',)
    list_select_related = ('client', 'barber', 'shop', 'haircut_type')
    list_per_page = 30
    autocomplete_fields = ('client', 'barber', 'shop', 'haircut_type')
    actions = (mark_confirmed, mark_completed, mark_cancelled)
    fieldsets = (
        (
            'Reserva',
            {
                'fields': ('client', 'shop', 'barber', 'haircut_type', 'date', 'time', 'status'),
            },
        ),
        ('Notas', {'fields': ('notes',)}),
        ('Fechas', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ('created_at', 'updated_at')
