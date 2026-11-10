from datetime import datetime

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from barbers.models import Barber, BarberShop, HaircutType
from clients.models import Client
from reservations.models import Reservation

from .authentication import issue_token
from .serializers import (
    STATUS_FROM_API,
    booking_payload,
    is_client,
    shop_payload,
    user_payload,
)


def fail(message, code=status.HTTP_400_BAD_REQUEST):
    return Response({'detail': message}, status=code)


def _clean_validation_error(exc):
    if hasattr(exc, 'message_dict'):
        return ' '.join(
            part
            for messages in exc.message_dict.values()
            for part in (messages if isinstance(messages, list) else [messages])
        )
    return ' '.join(exc.messages)


def _minutes(value):
    return value.hour * 60 + value.minute


def _as_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


@api_view(['GET'])
@permission_classes([AllowAny])
def health(_request):
    return Response({'status': 'ok', 'service': 'barberapp-api'})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = str(request.data.get('email', '')).strip().lower()
    password = str(request.data.get('password', ''))

    if not email or not password:
        return fail('Escribe tu email y tu contraseña.')

    user = Client.objects.select_related('preferred_barber__shop').filter(
        email__iexact=email
    ).first()
    if user is None:
        user = Barber.objects.select_related('shop').filter(email__iexact=email).first()

    if user is None or not user.check_password(password):
        return fail('Email o contraseña incorrectos.')

    if not user.is_active:
        return fail('Esta cuenta está desactivada. Contacta con la administración.', status.HTTP_403_FORBIDDEN)

    return Response({'token': issue_token(user), 'user': user_payload(user)})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    name = str(request.data.get('name', '')).strip()
    email = str(request.data.get('email', '')).strip().lower()
    phone = str(request.data.get('phone', '')).strip()
    password = str(request.data.get('password', ''))
    gender = str(request.data.get('gender', '')).strip()

    if len(name) < 3:
        return fail('Escribe tu nombre completo.')
    try:
        validate_email(email)
    except DjangoValidationError:
        return fail('El email no tiene un formato válido.')
    if len(phone.replace(' ', '').replace('-', '')) < 9:
        return fail('Escribe un teléfono de al menos 9 dígitos.')
    if gender not in Client.Gender.values:
        return fail('Selecciona cómo te identificas.')
    if len(password) < 6:
        return fail('La contraseña debe tener al menos 6 caracteres.')
    if Client.objects.filter(email__iexact=email).exists() or Barber.objects.filter(email__iexact=email).exists():
        return fail('Ya existe una cuenta con ese email.')

    parts = name.split()
    client = Client.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=parts[0],
        last_name=' '.join(parts[1:]),
        phone=phone,
        gender=gender,
    )
    return Response(
        {'token': issue_token(client), 'user': user_payload(client)},
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def me_view(request):
    return Response({'user': user_payload(request.user)})


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(_request):
    # Los tokens son autocontenidos: el cliente los elimina. El endpoint existe
    # para que el frontend tenga un cierre de sesión explícito y comprobable.
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def shops_view(request):
    query = str(request.query_params.get('q', '')).strip()
    shops = (
        BarberShop.objects.prefetch_related('barbers', 'haircut_types')
        .all()
        .order_by('name')
    )
    if query:
        shops = shops.filter(
            Q(name__icontains=query)
            | Q(address__icontains=query)
            | Q(city__icontains=query)
            | Q(description__icontains=query)
            | Q(tags__icontains=query)
            | Q(shop_type__icontains=query)
            | Q(haircut_types__name__icontains=query)
        ).distinct()
    return Response([shop_payload(shop) for shop in shops])


@api_view(['GET'])
def shop_detail_view(_request, pk):
    shop = get_object_or_404(
        BarberShop.objects.prefetch_related('barbers', 'haircut_types'),
        pk=pk,
    )
    return Response(shop_payload(shop))


@api_view(['GET'])
def availability_view(request):
    shop_id = request.query_params.get('shop')
    barber_id = request.query_params.get('barber')
    raw_date = request.query_params.get('date')

    if not shop_id or not barber_id or not raw_date:
        return fail('Faltan la peluquería, el profesional o la fecha.')

    try:
        day = datetime.strptime(raw_date, '%Y-%m-%d').date()
    except ValueError:
        return fail('La fecha no es válida.')

    shop_pk = _as_int(shop_id)
    barber_pk = _as_int(barber_id)
    if shop_pk is None or barber_pk is None:
        return fail('La peluquería o el profesional no son válidos.')

    barber = Barber.objects.filter(pk=barber_pk).first()
    if barber is None:
        return fail('El profesional no existe.', status.HTTP_404_NOT_FOUND)
    if barber.shop_id != shop_pk:
        return fail('El profesional no trabaja en esta peluquería.')

    booked = (
        Reservation.objects.filter(
            barber=barber,
            date=day,
        )
        .exclude(status=Reservation.Status.CANCELLED)
        .select_related('haircut_type')
        .order_by('time')
    )
    busy = [
        {
            'time': reservation.time.strftime('%H:%M'),
            'durationMin': (
                reservation.haircut_type.duration_minutes
                if reservation.haircut_type
                else 30
            ),
        }
        for reservation in booked
    ]
    return Response(
        {
            'times': [item['time'] for item in busy],
            'busy': busy,
        }
    )


@api_view(['GET', 'POST'])
def bookings_view(request):
    if request.method == 'GET':
        qs = Reservation.objects.select_related(
            'client',
            'barber',
            'shop',
            'haircut_type',
        )
        if is_client(request.user):
            qs = qs.filter(client=request.user)
        else:
            qs = qs.filter(barber=request.user)
        return Response([booking_payload(item) for item in qs])

    if not is_client(request.user):
        return fail('Las reservas se crean desde una cuenta de cliente.', status.HTTP_403_FORBIDDEN)

    client = request.user
    shop_id = request.data.get('barbershopId')
    barber_id = request.data.get('barberId')
    service_id = request.data.get('serviceId')
    raw_date = str(request.data.get('date', '')).strip()
    raw_time = str(request.data.get('time', '')).strip()
    notes = str(request.data.get('notes', '')).strip()[:200]

    if not all((shop_id, barber_id, service_id, raw_date, raw_time)):
        return fail('Faltan datos para preparar la reserva.')

    shop_pk = _as_int(shop_id)
    barber_pk = _as_int(barber_id)
    service_pk = _as_int(service_id)
    if shop_pk is None or barber_pk is None or service_pk is None:
        return fail('La peluquería, el profesional o el servicio no son válidos.')

    shop = BarberShop.objects.filter(pk=shop_pk).first()
    barber = Barber.objects.filter(pk=barber_pk).first()
    service = HaircutType.objects.filter(pk=service_pk).first()
    if shop is None or barber is None or service is None:
        return fail('La peluquería, el profesional o el servicio no existen.', status.HTTP_404_NOT_FOUND)

    if barber.shop_id != shop.pk:
        return fail('El profesional no pertenece a esta peluquería.')
    if service.shop_id != shop.pk:
        return fail('El servicio no pertenece a esta peluquería.')
    if service.only_for_men and client.gender != Client.Gender.MAN:
        return fail('Los servicios de barba solo están disponibles para clientes hombres.')

    try:
        day = datetime.strptime(raw_date, '%Y-%m-%d').date()
        hour = datetime.strptime(raw_time, '%H:%M').time()
    except ValueError:
        return fail('La fecha o la hora no son válidas.')

    appointment = timezone.make_aware(
        datetime.combine(day, hour),
        timezone.get_current_timezone(),
    )
    if appointment < timezone.now():
        return fail('No se puede reservar en una fecha u hora pasada.')

    weekday = (day.weekday() + 1) % 7  # 0=domingo … 6=sábado
    if weekday in shop.closed_day_list:
        return fail('La peluquería está cerrada ese día.')

    if shop.opening_time and shop.closing_time:
        start = _minutes(hour)
        if start < _minutes(shop.opening_time) or start + service.duration_minutes > _minutes(shop.closing_time):
            return fail('La hora elegida está fuera del horario de la peluquería.')

    existing = (
        Reservation.objects.filter(
            barber=barber,
            date=day,
        )
        .exclude(status=Reservation.Status.CANCELLED)
        .select_related('haircut_type')
    )
    start = _minutes(hour)
    end = start + service.duration_minutes
    for item in existing:
        item_duration = item.haircut_type.duration_minutes if item.haircut_type else 30
        item_start = _minutes(item.time)
        if start < item_start + item_duration and item_start < end:
            return fail('Ese hueco acaba de ocuparse. Elige otro horario.')

    reservation = Reservation(
        client=client,
        barber=barber,
        shop=shop,
        haircut_type=service,
        date=day,
        time=hour,
        notes=notes,
    )
    try:
        with transaction.atomic():
            reservation.full_clean()
            reservation.save()
    except DjangoValidationError as exc:
        return fail(_clean_validation_error(exc))
    except IntegrityError:
        return fail('Ese hueco acaba de ocuparse. Elige otro horario.')

    return Response(booking_payload(reservation), status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
def booking_detail_view(request, pk):
    qs = Reservation.objects.select_related('client', 'barber', 'shop', 'haircut_type')
    if is_client(request.user):
        reservation = qs.filter(pk=pk, client=request.user).first()
    else:
        reservation = qs.filter(pk=pk, barber=request.user).first()

    if reservation is None:
        return fail('Reserva no encontrada.', status.HTTP_404_NOT_FOUND)

    raw_status = str(request.data.get('status', '')).strip()
    new_status = STATUS_FROM_API.get(raw_status) or (
        raw_status if raw_status in Reservation.Status.values else None
    )
    if new_status is None:
        return fail('Estado de reserva no válido.')

    if is_client(request.user) and new_status != Reservation.Status.CANCELLED:
        return fail('Solo puedes cancelar tus propias reservas.', status.HTTP_403_FORBIDDEN)

    if reservation.status in (Reservation.Status.COMPLETED, Reservation.Status.CANCELLED):
        return fail('Esta reserva ya está cerrada.')

    reservation.status = new_status
    reservation.save(update_fields=['status', 'updated_at'])
    return Response(booking_payload(reservation))
