# BarberApp

Aplicación web para localizar peluquerías de **hombres**, de **mujeres** o **unisex** y reservar
cita. Monorepo con:

- **`frontend/`**: PWA *mobile first* en React 19 + Vite + TypeScript + Tailwind CSS.
- **`backend/`**: Django 6 + Django REST Framework + **GeoDjango** con **SpatiaLite**.

> **Estado actual:** el frontend consume la API real de Django. La sesión se guarda con un token
> firmado, las citas viven en la base de datos y el catálogo de Sevilla se carga desde el backend.
> Las cuentas y citas de demostración se crean con un comando idempotente, no con datos locales del
> navegador.

## Funcionalidad destacada

- **Acceso obligatorio:** sin sesión solo se pueden ver `/entrar` y `/registro`. Cualquier enlace
  profundo redirige al login y, después de entrar, vuelve a la ruta solicitada.
- **Registro solo para clientes:** el formulario crea siempre una cuenta de rol `cliente`. Las
  cuentas de barbero/a se crean desde Django Admin.
- **Género autodeclarado:** el registro pide cómo se identifica la persona. Los servicios de barba
  solo están disponibles para quien elige **Hombre**; el resto de personas no ven ese apartado ni en
  la ficha ni en el flujo de reserva.
- **Tres tipos de peluquería:** el inicio permite filtrar por **Hombres**, **Mujeres** y **Unisex**.
  Los datos de demo incluyen 10 establecimientos repartidos por barrios reales de Sevilla (Triana,
  Santa Cruz, El Arenal, Macarena, Los Remedios, Nervión, Alameda y La Cartuja).
- **Mapa con geolocalización:** al abrir el mapa o el inicio se solicita la ubicación real, se
  ordenan las peluquerías por distancia y se muestran los estados de permiso denegado, error y
  reintento. Si no hay ubicación, se usa el centro de Sevilla como respaldo.
- **Reserva validada en servidor:** el backend comprueba horario, día cerrado, solapes, duración y
  restricción de servicios de barba. La disponibilidad se consulta a la API.
- **Django Admin operativo:** permite crear peluquerías, servicios, profesionales, clientes y
  reservas. La ubicación se edita sobre un mapa centrado en Sevilla.

## Estructura

```
BARBERAPP/
├── backend/
│   ├── barberapp/          # configuración Django (GeoDjango + SpatiaLite + DRF)
│   ├── api/                # autenticación, serialización, vistas, rutas y seed_demo
│   ├── barbers/            # BarberShop, Barber, HaircutType
│   ├── clients/            # Client
│   ├── reservations/       # Reservation + validaciones de negocio
│   ├── .gdal/              # GDAL/GEOS locales (ignorado por git)
│   ├── .spatialite/        # SpatiaLite local (ignorado por git)
│   ├── iniciar.bat         # arranca Django (API + Admin) en Windows
│   ├── parar.bat           # detiene Django en Windows
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/             # favicon e iconos PWA
│   ├── src/                # api, auth, components, pages, lib…
│   ├── iniciar.bat         # arranca el frontend en Windows
│   ├── parar.bat           # detiene el servidor del frontend
│   └── vite.config.ts      # React + Tailwind + PWA + proxy /api → :8000
├── docker-compose.yml      # PostgreSQL opcional para desarrollo
└── README.md
```

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20.19+ o 22.12+ |
| Python | 3.12+ (probado con 3.14.7) |
| GDAL/GEOS + SpatiaLite | Necesarios para el backend. En Windows se instalan en local (ver abajo) |
| Docker | Opcional (el `docker-compose.yml` actual es PostgreSQL **sin PostGIS**) |

## Puesta en marcha rápida

Necesitas **dos terminales**: una para Django y otra para Vite.

En Windows, la forma más rápida es hacer doble clic en **`backend/iniciar.bat`** (abre la API y el
Admin en el puerto 8000) y, en otra ventana, en **`frontend/iniciar.bat`** (abre la app en el 5173).
Deja las dos ventanas abiertas. `backend/parar.bat` y `frontend/parar.bat` detienen cada servidor.

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
```

Instala GDAL/GEOS y SpatiaLite si aún no están (ver la sección siguiente), aplica migraciones, crea
los datos de demostración y arranca el servidor:

```bash
python manage.py migrate
python manage.py seed_demo
python manage.py createsuperuser
python manage.py runserver 8000
```

- API: <http://localhost:8000/api/health/>
- Admin: <http://localhost:8000/admin/>

`seed_demo` es **idempotente**: puedes ejecutarlo varias veces sin duplicar los 10 salones, sus 40
servicios, los 26 profesionales ni las cuentas de demo.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda en <http://localhost:5173>. En Windows también puedes hacer doble clic en
`frontend/iniciar.bat` (arranca Vite y abre el navegador) y usar `frontend/parar.bat` para
detenerlo. Recuerda que la API y el Admin necesitan **`backend/iniciar.bat`** en otra ventana. El
puerto está fijado con `strictPort`.

Vite reenvía `/api/*` a `http://localhost:8000`, por lo que frontend y API se usan desde el mismo
origen y no hace falta configurar CORS.

### Cuentas de demostración

| Rol | Email | Contraseña | Género autodeclarado |
|---|---|---|---|
| Cliente | `cliente@barberapp.dev` | `123456` | Mujer |
| Barbero | `barbero@barberapp.dev` | `123456` | Hombre |

La pantalla de acceso no muestra botones de demo: escribe el email y la contraseña. La clienta de
demo (Lucía, mujer) no verá los servicios de barba; el barbero de demo (Mateo, hombre) sí. También
puedes crear una cuenta de cliente nueva desde **Registrarme como cliente**; esa cuenta se guarda en
la base de datos de Django. **No introduzcas datos personales reales** (el repositorio es público).

Para probar la PWA (service worker e instalación):

```bash
npm run build
npm run preview
```

## Django Admin explicado de forma sencilla

El admin es el **panel de gestión interna**. No lo usa el cliente final: lo usas tú para dar de alta
lo que aparece en la app.

Entra en <http://localhost:8000/admin/> con el superusuario que hayas creado.

### Orden recomendado para crear datos

1. **Peluquerías** → *Añadir peluquería*.
   - Rellena nombre, tipo (`hombres`, `mujeres` o `unisex`), dirección, teléfono, horario y días
     cerrados (`0`=domingo, `1`=lunes… `6`=sábado).
   - En **Ficha pública** pones descripción, imagen, valoración, etiquetas y nivel de precio. Es lo
     que verá el cliente.
   - En **Mapa** haces clic en la ubicación real de Sevilla.
   - En la misma pantalla, al final, puedes añadir sus **servicios** (nombre, precio, duración y
     casilla **solo para hombres** para barba/afeitado).

2. **Barberos/as** → *Añadir barbero/a*.
   - El **email** será su usuario para entrar en la app.
   - Escribe una contraseña segura dos veces.
   - Asígnale una **peluquería**, especialidad, valoración y años de experiencia.
   - Con esa cuenta podrá entrar en la PWA y ver su **Agenda**.

3. **Clientes** → normalmente **no hace falta crearlos aquí**: se registran desde la app. El admin
   sirve para corregir datos, desactivar una cuenta o cambiar una contraseña.

4. **Reservas** → puedes consultar, confirmar, completar o cancelar citas. Para crear una cita
   manualmente elige cliente, peluquería, profesional, servicio, fecha y hora.

### Reglas que aplica el admin

- Un barbero/a solo puede pertenecer a una peluquería.
- Un servicio pertenece a una peluquería.
- Los servicios marcados como **solo para hombres** quedan ocultos para clientas y la API rechaza
  la reserva aunque se intente por URL.
- Los campos de auditoría (`creado`, `actualizado`) se rellenan solos.

## API

Todas las rutas salvo `health`, `login` y `register` requieren `Authorization: Bearer <token>`.

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/api/health/` | Comprobar que el servidor responde |
| `POST` | `/api/auth/login/` | Entrar con email y contraseña |
| `POST` | `/api/auth/register/` | Registrar un cliente |
| `GET` | `/api/auth/me/` | Recuperar el usuario del token |
| `POST` | `/api/auth/logout/` | Cierre de sesión explícito |
| `GET` | `/api/shops/` | Catálogo de peluquerías (`?q=` busca por nombre, zona, etiqueta…) |
| `GET` | `/api/shops/<id>/` | Detalle de una peluquería |
| `GET` | `/api/availability/` | Horas ocupadas (`shop`, `barber`, `date`) |
| `GET` | `/api/bookings/` | Citas del cliente o de la agenda del barbero |
| `POST` | `/api/bookings/` | Crear una reserva |
| `PATCH` | `/api/bookings/<id>/` | Cancelar (cliente) o cambiar estado (barbero) |

Los tokens están firmados con `django.core.signing` y caducan a los 30 días. No se usan sesiones de
Django en la API porque `Client` y `Barber` son modelos separados del `auth.User` que protege el
admin.

## Variables de entorno

En local funciona sin configurar nada. Para producción:

| Variable | Uso |
|---|---|
| `DJANGO_SECRET_KEY` | Clave secreta real. Obligatoria si `DJANGO_DEBUG=0` |
| `DJANGO_DEBUG` | `0` para producción |
| `DJANGO_ALLOWED_HOSTS` | Lista separada por comas |

PowerShell de ejemplo:

```powershell
$env:DJANGO_DEBUG = '0'
$env:DJANGO_SECRET_KEY = 'una-clave-larga-y-aleatoria'
$env:DJANGO_ALLOWED_HOSTS = 'midominio.com,www.midominio.com'
python manage.py runserver 0.0.0.0:8000
```

El frontend usa `/api` por defecto. Si la API está en otro dominio, define `VITE_API_URL` antes de
compilar:

```bash
set VITE_API_URL=https://api.midominio.com/api
npm run build
```

## Instalar GDAL/GEOS y SpatiaLite (Windows)

Django necesita las librerías nativas de GDAL, GEOS y SpatiaLite. No se suben al repositorio: se
descargan una vez en `backend/.gdal/` y `backend/.spatialite/` (ambas rutas están ignoradas por git).
El `settings.py` las carga automáticamente si existen.

Para **Python 3.14 en Windows x64**:

```powershell
cd backend

# GDAL + GEOS (rueda de cgohlke/geospatial-wheels)
$gdal = Join-Path $env:TEMP 'gdal-3.13.3-cp314-cp314-win_amd64.whl'
curl.exe -L -o $gdal 'https://github.com/cgohlke/geospatial-wheels/releases/download/v2026.8.20/gdal-3.13.3-cp314-cp314-win_amd64.whl'
python -m zipfile -e $gdal .gdal

# SpatiaLite + PROJ
$spatialite = Join-Path $env:TEMP 'mod_spatialite-5.1.0-win-amd64.7z'
curl.exe -L -o $spatialite 'https://www.gaia-gis.it/gaia-sins/windows-bin-amd64/mod_spatialite-5.1.0-win-amd64.7z'
New-Item -ItemType Directory -Force .spatialite | Out-Null
tar --strip-components 1 -xf $spatialite -C .spatialite
```

> Si usas otra versión de Python, descarga la rueda `cpXXX` correspondiente de la misma release de
> `geospatial-wheels`. En Linux/macOS normalmente basta con instalar los paquetes del sistema
> (`gdal-bin`, `libgeos-c1v5`, `libsqlite3-mod-spatialite`) y no hace falta esta carpeta local.

Comprueba que todo carga antes de continuar:

```bash
python manage.py check
```

## Tests

```bash
cd backend
python manage.py test
```

Cubre autenticación, catálogo, tipos de peluquería, disponibilidad, creación y cancelación de
reservas, solapes y la regla de negocio de los servicios de barba.

```bash
cd frontend
npm run build
```

El build ejecuta el typecheck de TypeScript y genera la PWA.

## Scripts útiles

| Comando | Dónde | Descripción |
|---|---|---|
| `npm run dev` | `frontend/` | Servidor de desarrollo con HMR (5173) |
| `npm run build` | `frontend/` | Typecheck + build de producción + service worker |
| `npm run preview` | `frontend/` | Sirve el build para probar la PWA |
| `python manage.py check` | `backend/` | Comprueba Django y las librerías geoespaciales |
| `python manage.py migrate` | `backend/` | Aplica las migraciones |
| `python manage.py seed_demo` | `backend/` | Crea/actualiza los datos ficticios de Sevilla |
| `python manage.py test` | `backend/` | Ejecuta los tests |
| `python manage.py runserver` | `backend/` | API/Admin en el puerto 8000 |
| `docker compose up -d db` | raíz | Levanta PostgreSQL (opcional, sin PostGIS) |

## Limitaciones conocidas

- El pago se realiza en la barbería: no hay pasarela de pago.
- Las notificaciones push quedan como ampliación futura.
- La geolocalización requiere `https` o `localhost` y permiso del navegador. Si se deniega, la app
  sigue funcionando con el centro de Sevilla como posición de respaldo.
- El `docker-compose.yml` actual es PostgreSQL sin PostGIS; para usarlo con GeoDjango habría que
  cambiar la imagen por una de PostGIS y el engine del backend.
