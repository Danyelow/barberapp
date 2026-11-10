from django.core import signing
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from barbers.models import Barber
from clients.models import Client

TOKEN_SALT = 'barberapp.api.auth.v1'
TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 días


def issue_token(user):
    kind = 'barber' if isinstance(user, Barber) else 'client'
    return signing.dumps({'kind': kind, 'id': user.pk}, salt=TOKEN_SALT, compress=True)


class BearerAuthentication(BaseAuthentication):
    """Autenticación por token firmado para la API de la PWA.

    No usamos las sesiones de Django porque `Client` y `Barber` son modelos
    separados del usuario que protege el admin. El token evita además problemas
    de CSRF entre Vite y Django.
    """

    def authenticate_header(self, request):
        return 'Bearer'

    def authenticate(self, request):
        parts = get_authorization_header(request).split()
        if not parts or parts[0].lower() != b'bearer':
            return None
        if len(parts) != 2:
            raise AuthenticationFailed('Cabecera de autorización no válida.')

        try:
            payload = signing.loads(
                parts[1].decode(),
                salt=TOKEN_SALT,
                max_age=TOKEN_MAX_AGE,
            )
        except signing.BadSignature as exc:
            raise AuthenticationFailed('La sesión ha caducado. Vuelve a entrar.') from exc

        model = Barber if payload.get('kind') == 'barber' else Client
        queryset = model.objects.all()
        if model is Barber:
            queryset = queryset.select_related('shop')
        try:
            user = queryset.get(pk=payload.get('id'), is_active=True)
        except model.DoesNotExist as exc:
            raise AuthenticationFailed('La cuenta ya no está disponible.') from exc

        return user, payload
