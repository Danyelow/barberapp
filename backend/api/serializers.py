from barbers.models import Barber
from clients.models import Client
from reservations.models import Reservation

STATUS_TO_API = {
    Reservation.Status.PENDING: 'pendiente',
    Reservation.Status.CONFIRMED: 'confirmada',
    Reservation.Status.COMPLETED: 'completada',
    Reservation.Status.CANCELLED: 'cancelada',
}
STATUS_FROM_API = {value: key for key, value in STATUS_TO_API.items()}


def _barber_name(barber):
    return barber.get_full_name() or barber.username


def _client_name(client):
    return client.get_full_name() or client.username


def user_payload(user):
    if isinstance(user, Barber):
        return {
            'id': f'b-{user.pk}',
            'name': _barber_name(user),
            'email': user.email,
            'phone': user.phone,
            'role': 'barbero',
            'barberId': str(user.pk),
            'barbershopId': str(user.shop_id) if user.shop_id else None,
            'barbershopName': user.shop.name if user.shop_id else None,
            'speciality': user.speciality,
            'rating': float(user.rating),
            'years': user.years_experience,
        }

    return {
        'id': f'c-{user.pk}',
        'name': _client_name(user),
        'email': user.email,
        'phone': user.phone,
        'role': 'cliente',
        'gender': user.gender,
    }


def _offer_payload(shop):
    offer = getattr(shop, 'offer', None)
    if offer is None or not offer.is_current:
        return None
    return {
        'title': offer.title,
        'description': offer.description,
        'discountPercent': offer.discount_percent,
        'validUntil': offer.valid_until.isoformat() if offer.valid_until else None,
    }


def shop_payload(shop):
    location = shop.location
    lat = location.y if location else 37.3891
    lng = location.x if location else -5.9845

    return {
        'id': str(shop.pk),
        'name': shop.name,
        'address': shop.address,
        'city': shop.city,
        'lat': lat,
        'lng': lng,
        'shopType': shop.shop_type,
        'rating': float(shop.rating),
        'reviews': shop.reviews,
        'priceLevel': shop.price_level,
        'cover': shop.cover_url,
        'description': shop.description,
        'phone': shop.phone,
        'tags': shop.tag_list,
        'opensAt': shop.opening_time.strftime('%H:%M') if shop.opening_time else '10:00',
        'closesAt': shop.closing_time.strftime('%H:%M') if shop.closing_time else '20:00',
        'closedDays': shop.closed_day_list,
        'offer': _offer_payload(shop),
        'services': [
            {
                'id': str(service.pk),
                'name': service.name,
                'description': service.description,
                'durationMin': service.duration_minutes,
                'price': float(service.price),
                'onlyForMen': service.only_for_men,
            }
            for service in shop.haircut_types.all()
        ],
        'barbers': [
            {
                'id': str(barber.pk),
                'name': _barber_name(barber),
                'specialty': barber.speciality,
                'rating': float(barber.rating),
                'years': barber.years_experience,
            }
            for barber in shop.barbers.filter(is_active=True)
        ],
    }


def booking_payload(reservation):
    service = reservation.haircut_type
    shop = reservation.shop
    barber = reservation.barber

    return {
        'id': str(reservation.pk),
        'userId': f'c-{reservation.client_id}',
        'customerName': _client_name(reservation.client),
        'customerPhone': reservation.client.phone,
        'barbershopId': str(reservation.shop_id),
        'barberId': str(reservation.barber_id),
        'serviceId': str(reservation.haircut_type_id) if reservation.haircut_type_id else '',
        'date': reservation.date.isoformat(),
        'time': reservation.time.strftime('%H:%M'),
        'durationMin': service.duration_minutes if service else 30,
        'price': float(service.price) if service else 0,
        'status': STATUS_TO_API.get(reservation.status, 'pendiente'),
        'notes': reservation.notes,
        'createdAt': reservation.created_at.isoformat(),
        'barbershopName': shop.name,
        'barbershopCover': shop.cover_url,
        'barberName': _barber_name(barber),
        'serviceName': service.name if service else 'Servicio',
        'serviceDurationMin': service.duration_minutes if service else 30,
    }


def is_client(user):
    return isinstance(user, Client)
