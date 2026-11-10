# BarberApp · Frontend (PWA)

Aplicación web progresiva **mobile first** para localizar peluquerías de **hombres**, **mujeres** o
**unisex**, consultar servicios y reservar cita con el profesional que elijas. Incluye panel de
agenda para barberos/as.

Este directorio es el **frontend** del proyecto BarberApp. Consume la API real de Django mediante
`fetch`; ya no usa datos simulados en `localStorage`.

## Stack

| Pieza | Versión | Uso |
|---|---|---|
| React | 19 | Interfaz por componentes |
| Vite | 8 | Dev server y build |
| TypeScript | 6 | Tipado estático |
| Tailwind CSS | 4 | Estilos utilitarios (`@tailwindcss/vite`) |
| React Router | 7 | Rutas de la SPA |
| Leaflet + React Leaflet | 1.9 / 5 | Mapa interactivo con OpenStreetMap |
| vite-plugin-pwa | 2 | Manifest + service worker (offline e instalación) |
| lucide-react | — | Iconografía |

## Requisitos

- Node.js 20.19+ o 22.12+.
- El **backend Django** arrancado en `http://localhost:8000` (ver [`../README.md`](../README.md)).
- La base de datos con los datos de demo: `python manage.py seed_demo`.

## Puesta en marcha

### Opción rápida (Windows)

1. Arranca primero el backend (API/Admin) en el puerto 8000.
2. Doble clic en **`iniciar.bat`**: comprueba Node, instala dependencias si es la primera vez,
   arranca Vite y abre el navegador en <http://localhost:5173>.
3. Deja la ventana abierta mientras uses la app. Para detenerlo, pulsa `Ctrl + C` o ejecuta
   **`parar.bat`**.

### Opción manual

```bash
cd frontend
npm install
npm run dev
```

- App: <http://localhost:5173>.
- Móvil en la misma red: `npm run dev -- --host` y abre `http://IP_DEL_PC:5173`.
- Para probar la PWA en local, ejecuta `npm run build` y después `npm run preview` (puerto 4173).

> **Si el navegador dice «No se puede acceder a este sitio web / ERR_CONNECTION_REFUSED» en
> `localhost:5173`**, el servidor de desarrollo no está arrancado: ejecuta `npm run dev` (o
> `iniciar.bat`) y deja la terminal abierta. El puerto está fijado con `strictPort`.

## Cuentas de demostración

| Rol | Email | Contraseña | Género autodeclarado |
|---|---|---|---|
| Cliente | `cliente@barberapp.dev` | `123456` | Mujer |
| Barbero | `barbero@barberapp.dev` | `123456` | Hombre |

También puedes registrarte como cliente: el formulario pide nombre, email, teléfono, género y
contraseña, y la cuenta se guarda en la base de datos de Django. El registro de barberos/as no está
disponible en la app: esas cuentas se crean desde Django Admin. La pantalla de login no muestra
botones de demo, pero las cuentas de la tabla siguen existiendo para que las escribas manualmente.
**No introduzcas datos personales reales** (el repositorio es público).

## Funcionalidad

- **Acceso**: sin sesión solo se muestran `/entrar` y `/registro`. Cualquier enlace profundo
  redirige al login y vuelve a la ruta solicitada después de entrar.
- **Sesión con token**: el login guarda un token firmado en `localStorage` y lo envía como
  `Authorization: Bearer`. Al recargar se valida contra `/api/auth/me/`; si caduca, se cierra la
  sesión y los datos protegidos no se muestran.
- **Registro solo para clientes**: el alta crea siempre cuentas `cliente`; las de barbero se
  gestionan desde la administración. El género es obligatorio y se usa para aplicar restricciones.
- **Inicio**: buscador por peluquería / servicio / zona, filtros **Todas / Hombres / Mujeres /
  Unisex**, tarjetas con distancia, rating, precio desde y estado (abierto/cerrado), y recordatorio
  de la próxima cita. Al entrar se solicita la ubicación y los resultados se ordenan por cercanía.
- **Mapa**: al abrir la pantalla pide geolocalización, centra el mapa en la persona usuaria, ordena
  las peluquerías por distancia y muestra la ficha flotante con enlace a la reserva. Incluye estados
  de permiso denegado, error, reintento y respaldo en el centro de Sevilla.
- **Detalle de peluquería**: portada, descripción, tipo de peluquería, servicios con duración y
  precio, equipo, horario, llamar, compartir y favorito. Los servicios de barba se ocultan de la
  lista y del flujo de reserva a quienes no se identifican como hombres.
- **Reserva en 4 pasos**: servicio → profesional → día y hora → confirmación.
  - La peluquería y sus servicios se cargan desde la API usando los IDs reales.
  - La disponibilidad se consulta a `/api/availability/`; el backend vuelve a validar horario, día
    cerrado, duración, solapes y restricción de barba antes de guardar.
  - Notas opcionales para el profesional y confirmación con resumen.
- **Mis citas**: próximas e historial, cancelación con confirmación y repetición de una reserva.
- **Agenda (barbero/a)**: citas de hoy, próximas e historial; confirmar, completar o cancelar;
  contacto directo con el cliente; métricas de hoy, pendientes e ingresos.
- **Perfil**: datos de la cuenta, preferencias, instalación de la PWA y cierre de sesión.

## Rutas

Todas las rutas salvo las dos de autenticación requieren sesión.

| Ruta | Descripción |
|---|---|
| `/` | Descubrir peluquerías |
| `/mapa` | Mapa interactivo con geolocalización (`?shop=id` preselecciona una peluquería) |
| `/barberia/:id` | Detalle de peluquería (ID devuelto por la API) |
| `/barberia/:id/reservar` | Flujo de reserva (`?servicio=` y `?barbero=` preseleccionan) |
| `/citas` | Mis citas |
| `/agenda` | Panel del barbero/a |
| `/perfil` | Cuenta y ajustes |
| `/entrar`, `/registro` | Autenticación (solo sin sesión) |

## Estructura

```
frontend/
├── public/
│   ├── favicon.svg
│   └── icons/                  # iconos PWA (192, 512, maskable, apple-touch)
├── src/
│   ├── api/api.ts              # fetch a Django, token Bearer y errores de API
│   ├── auth/                   # AuthContext, RequireAuth, PublicOnly
│   ├── components/             # AppShell, BottomNav, MapView, BookingCard, ui…
│   ├── data/barbershops.ts     # tipos del catálogo y etiquetas de tipo
│   ├── lib/                    # fechas, disponibilidad, geo, servicios, cn…
│   │                           # useUserLocation: caché y estados de geolocalización
│   ├── pages/                  # una pantalla por ruta
│   ├── pwa/InstallPrompt.tsx   # beforeinstallprompt + instrucciones iOS
│   ├── store/BookingsContext.tsx
│   ├── ui/ToastContext.tsx
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts              # react + tailwind + VitePWA + proxy /api → :8000
└── tsconfig*.json
```

## Conexión con la API

- `src/api/api.ts` centraliza las llamadas y el token.
- En desarrollo, Vite reenvía `/api` a `http://localhost:8000` (también en `preview`), así que no
  hay CORS ni URL absoluta en el código.
- Si la API vive en otro dominio, define `VITE_API_URL` antes de compilar:

```bash
set VITE_API_URL=https://api.midominio.com/api
npm run build
```

- Cuando la API responde `401`, se borra el token y se vuelve al login.
- Los IDs de peluquería, servicio y profesional son los numéricos que devuelve Django; no hay slugs
  fijos en el frontend.

## Mobile first

- Diseño pensado para 360–430 px: una columna, acciones al alcance del pulgar y navegación inferior
  fija con 4 pestañas según el rol.
- Zonas seguras (`env(safe-area-inset-*)`) para notch y barra de gestos.
- Áreas táctiles de 44 px, feedback `active:scale`, `prefers-reduced-motion` respetado.
- En pantallas grandes la app se centra como shell de móvil (máx. 512 px) sobre fondo oscuro.
- Contenido y mapa a pantalla completa, tarjetas flotantes y hojas inferiores (bottom sheets).

## PWA

- `manifest.webmanifest` con nombre, colores, iconos `any` + `maskable`, orientación vertical y
  atajos a *Mis citas* y *Mapa*.
- Service worker `generateSW` con precache del build y `navigateFallback` para funcionar offline.
- Botón de instalación en **Perfil** (usa `beforeinstallprompt`; en iOS muestra instrucciones de
  *Compartir → Añadir a pantalla de inicio*).
- El CSS del mapa y la pantalla de reserva se cargan con `React.lazy` para aligerar la primera carga.

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Desarrollo con HMR en el puerto 5173 |
| `npm run build` | Typecheck (`tsc -b`) + build de producción + service worker |
| `npm run preview` | Sirve el build (ideal para probar la instalación PWA) |

## Limitaciones conocidas

- El pago se realiza en la peluquería: no hay pasarela de pago.
- El alta de peluquerías y barberos/as se hace desde Django Admin, fuera de este frontend.
- La geolocalización requiere `https` o `localhost` y permiso del navegador. Si se deniega, la app
  sigue funcionando con el centro de Sevilla como posición de respaldo.
- Las notificaciones push quedan como ampliación futura.
