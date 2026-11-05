# BarberApp

Aplicación web para localizar peluquerías de hombres y de mujeres y reservar cita. Monorepo con:

- **`frontend/`**: PWA *mobile first* en React 19 + Vite + TypeScript + Tailwind CSS.
- **`backend/`**: proyecto Django 6 + Django REST Framework + **GeoDjango** con base de datos
  **SpatiaLite**, con los modelos de barberías, barberos, clientes y reservas.

> **Estado actual:** el frontend funciona de forma autónoma con datos simulados en `localStorage`
> y todavía no consume la API. El backend ya está preparado para datos geográficos y para validar
> las reservas restringidas.

## Funcionalidad destacada

- **Acceso obligatorio:** sin sesión solo se pueden ver `/entrar` y `/registro`. Cualquier enlace
  profundo redirige al login y, después de entrar, vuelve a la ruta solicitada.
- **Registro solo para clientes:** el formulario crea siempre una cuenta de rol `cliente`. Las
  cuentas de barbero se crean desde la administración.
- **Género autodeclarado:** el registro pide cómo se identifica la persona. Los servicios de barba
  solo están disponibles para quien elige **Hombre**; las clientas no ven ese apartado ni en la
  ficha ni en la reserva.
- **Peluquerías de hombres y de mujeres:** el inicio permite filtrar por tipo de peluquería. Los
  datos de demo incluyen 10 establecimientos repartidos por barrios reales de Sevilla (Triana,
  Santa Cruz, El Arenal, Macarena, Los Remedios, Nervión, Alameda y La Cartuja).
- **Mapa con geolocalización:** al abrir el mapa o el inicio se solicita la ubicación real, se
  ordenan las peluquerías por distancia y se muestran los estados de permiso denegado, error y
  reintento. Si no hay ubicación, se usa el centro de Sevilla como respaldo.
- **GeoDjango:** `BarberShop.location` es un `PointField` (WGS84) editable con mapa en el Django
  Admin. `BarberShop.shop_type`, `HaircutType.only_for_men` y `Client.gender` aplican el tipo de
  peluquería y la restricción de barba también en backend.

## Estructura

```
BARBERAPP/
├── backend/
│   ├── barberapp/          # configuración del proyecto Django (GeoDjango + SpatiaLite)
│   ├── barbers/            # BarberShop, Barber, HaircutType
│   ├── clients/            # Client
│   ├── reservations/       # Reservation + validación de servicios restringidos
│   ├── .gdal/              # GDAL/GEOS locales (ignorado por git)
│   ├── .spatialite/        # SpatiaLite local (ignorado por git)
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

## Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda en <http://localhost:5173>. En Windows también puedes hacer doble clic en
`frontend/iniciar.bat` (arranca Vite y abre el navegador) y usar `frontend/parar.bat` para
detenerlo. El puerto está fijado con `strictPort`, así que si está ocupado el arranque falla
en vez de cambiar de puerto.

Cuentas de demostración:

| Rol | Email | Contraseña | Género autodeclarado |
|---|---|---|---|
| Cliente | `cliente@barberapp.dev` | `123456` | Mujer |
| Barbero | `barbero@barberapp.dev` | `123456` | Hombre |

La pantalla de acceso ya no muestra botones de demo: escribe cualquiera de estas cuentas para
seguir probando. La clienta de demo (Lucía, mujer) no verá los servicios de barba; el barbero de
demo (Mateo, hombre) sí. También puedes crear una cuenta de cliente nueva desde **Registrarme como
cliente** (se guarda solo en tu navegador). **No introduzcas datos personales reales** (el
repositorio es público).

Para probar la PWA (service worker e instalación):

```bash
npm run build
npm run preview
```

Más detalles en [`frontend/README.md`](frontend/README.md).

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
```

### 1. Instalar GDAL/GEOS y SpatiaLite (Windows)

Django necesita las librerías nativas de GDAL, GEOS y SpatiaLite. No se suben al repositorio:
se descargan una vez en `backend/.gdal/` y `backend/.spatialite/` (ambas rutas están ignoradas por
git). El `settings.py` las carga automáticamente si existen.

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

### 2. Base de datos y administración

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

- Django Admin: <http://localhost:8000/admin/>
- Base de datos por defecto: **SpatiaLite** (`backend/db.sqlite3`, con soporte espacial).
- En el admin, la barbería incluye un mapa centrado en Sevilla para fijar `location`. En servicios
  aparece la casilla **Only for men** para marcar los arreglos y afeitados de barba restringidos.
- El proxy de Vite reenvía `/api/*` a `http://localhost:8000`, listo para cuando se conecte la API.
- `docker-compose.yml` levanta un PostgreSQL normal; para usarlo con GeoDjango habría que cambiar
  la imagen por una de **PostGIS** y el engine a `django.contrib.gis.db.backends.postgis`.

### 3. Tests del backend

```bash
python manage.py test
```

Incluye pruebas de la regla de negocio: un cliente hombre puede reservar el servicio de barba, una
clienta no, y ambos pueden reservar un corte normal.

## Scripts útiles

| Comando | Dónde | Descripción |
|---|---|---|
| `npm run dev` | `frontend/` | Servidor de desarrollo con HMR (5173) |
| `npm run build` | `frontend/` | Typecheck + build de producción + service worker |
| `npm run preview` | `frontend/` | Sirve el build para probar la PWA |
| `python manage.py check` | `backend/` | Comprueba Django y las librerías geoespaciales |
| `python manage.py migrate` | `backend/` | Aplica las migraciones |
| `python manage.py test` | `backend/` | Ejecuta los tests |
| `python manage.py runserver` | `backend/` | API/Admin en el puerto 8000 |
| `docker compose up -d db` | raíz | Levanta PostgreSQL (opcional, sin PostGIS) |

## Siguientes pasos

- Exponer los endpoints REST (barberías, barberos, disponibilidad y reservas) y sustituir
  `frontend/src/api/mockApi.ts` por llamadas reales.
- Autenticación contra el backend (hoy la sesión se guarda en el navegador).
- Mover `SECRET_KEY`, `DEBUG` y `ALLOWED_HOSTS` a variables de entorno antes de desplegar.
- Empaquetar o documentar las librerías nativas para otros sistemas operativos.
