# BarberApp

Aplicación web para localizar barberías y reservar cita con un barbero. Monorepo con:

- **`frontend/`**: PWA *mobile first* en React 19 + Vite + TypeScript + Tailwind CSS.
- **`backend/`**: proyecto Django 6 + Django REST Framework con los modelos de barberías,
  barberos, clientes y reservas.

> **Estado actual:** el frontend funciona de forma autónoma con datos simulados en `localStorage`
> y todavía no consume la API. Las barberías, barberos y servicios se gestionan desde el
> Django Admin.

## Estructura

```
BARBERAPP/
├── backend/
│   ├── barberapp/          # configuración del proyecto Django
│   ├── barbers/            # BarberShop, Barber, HaircutType
│   ├── clients/            # Client
│   ├── reservations/       # Reservation
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
| Python | 3.12+ (probado con 3.14) |
| Docker | opcional (solo si quieres PostgreSQL) |

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

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | `cliente@barberapp.dev` | `123456` |
| Barbero | `barbero@barberapp.dev` | `123456` |

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
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

- Django Admin: <http://localhost:8000/admin/>
- Base de datos por defecto: SQLite (`backend/db.sqlite3`).
- `docker-compose.yml` levanta un PostgreSQL en el puerto `5432` si prefieres usarlo
  (tendrás que configurar `DATABASES` en `backend/barberapp/settings.py`).
- El proxy de Vite reenvía `/api/*` a `http://localhost:8000`, listo para cuando se conecte la API.

## Scripts útiles

| Comando | Dónde | Descripción |
|---|---|---|
| `npm run dev` | `frontend/` | Servidor de desarrollo con HMR (5173) |
| `npm run build` | `frontend/` | Typecheck + build de producción + service worker |
| `npm run preview` | `frontend/` | Sirve el build para probar la PWA |
| `python manage.py runserver` | `backend/` | API/Admin en el puerto 8000 |
| `python manage.py migrate` | `backend/` | Aplica las migraciones |
| `docker compose up -d db` | raíz | Levanta PostgreSQL (opcional) |

## Siguientes pasos

- Exponer los endpoints REST (barberías, barberos, disponibilidad y reservas) y sustituir
  `frontend/src/api/mockApi.ts` por llamadas reales.
- Autenticación contra el backend (hoy la sesión se guarda en el navegador).
- Mover `SECRET_KEY`, `DEBUG` y `ALLOWED_HOSTS` a variables de entorno antes de desplegar.
