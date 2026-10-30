# BarberApp · Frontend (PWA)

Aplicación web progresiva **mobile first** para localizar barberías, consultar servicios y reservar cita
con el barbero que elijas. Incluye panel de agenda para barberos.

Este directorio es el **frontend** del proyecto BarberApp: funciona de forma autónoma con una
capa de datos simulada (`localStorage`), por lo que no necesita backend para probarse.

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

## Puesta en marcha

### Opción rápida (Windows)

Doble clic en **`iniciar.bat`**: comprueba Node, instala dependencias si es la primera vez, arranca
Vite y abre el navegador en <http://localhost:5173>. Deja la ventana abierta mientras uses la app.
Para detenerlo, pulsa `Ctrl + C` en esa ventana o haz doble clic en **`parar.bat`**.

### Opción manual

```bash
cd frontend
npm install
npm run dev
```

- App: <http://localhost:5173>.
- Móvil en la misma red: `npm run dev -- --host` y abre `http://IP_DEL_PC:5173`.
- Para probar la PWA en local: `npm run build && npm run preview`.

> **Si el navegador dice «No se puede acceder a este sitio web / ERR_CONNECTION_REFUSED» en
> `localhost:5173`**, el servidor de desarrollo no está arrancado: ejecuta `npm run dev` (o
> `iniciar.bat`) y deja la terminal abierta. El servidor debe seguir en marcha mientras navegas.
> El puerto está fijado con `strictPort`, así que si aparece «Port 5173 is already in use» hay otra
> instancia abierta: ciérrala con `Ctrl + C` en su terminal.

## Cuentas de demostración

| Rol | Email | Contraseña |
|---|---|---|
| Cliente | `cliente@barberapp.dev` | `123456` |
| Barbero | `barbero@barberapp.dev` | `123456` |

También puedes registrarte: la cuenta se guarda solo en tu navegador.
**No introduzcas datos personales reales** (el repositorio es público).

## Funcionalidad

- **Inicio**: buscador por barbería / servicio / zona, filtros, tarjetas con distancia, rating,
  precio desde y estado (abierto/cerrado), y recordatorio de la próxima cita.
- **Mapa**: marcadores con precio, ficha flotante de la barbería y enlace a la reserva.
- **Detalle de barbería**: portada, descripción, servicios con duración y precio, equipo, horario,
  llamar, compartir y favorito.
- **Reserva en 4 pasos**: servicio → barbero → día y hora → confirmación.
  - Disponibilidad calculada en cliente: horario de apertura, duración del servicio, días cerrados,
    citas ya ocupadas y horas pasadas.
  - Notas opcionales para el barbero y confirmación con resumen.
- **Mis citas**: próximas e historial, cancelación con confirmación y repetición de una reserva.
- **Agenda (barbero)**: citas de hoy, próximas e historial; confirmar, completar o cancelar;
  contacto directo con el cliente; métricas de hoy, pendientes e ingresos.
- **Perfil**: datos de la cuenta, preferencias, instalación de la PWA, restablecer datos de demo y
  cierre de sesión.
- **Autenticación**: login, registro, sesión persistente y rutas protegidas con retorno a la ruta
  solicitada.

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Descubrir barberías |
| `/mapa` | Mapa interactivo (`?shop=id` preselecciona una barbería) |
| `/barberia/:id` | Detalle de barbería |
| `/barberia/:id/reservar` | Flujo de reserva (`?servicio=` y `?barbero=` preseleccionan) |
| `/citas` | Mis citas (requiere sesión) |
| `/agenda` | Panel del barbero |
| `/perfil` | Cuenta y ajustes |
| `/entrar`, `/registro` | Autenticación |

## Estructura

```
frontend/
├── public/
│   ├── favicon.svg
│   └── icons/                  # iconos PWA (192, 512, maskable, apple-touch)
├── src/
│   ├── api/
│   │   ├── mockApi.ts          # API simulada con latencia y validación de solapes
│   │   └── storage.ts          # localStorage + datos semilla
│   ├── auth/                   # AuthContext + RequireAuth
│   ├── components/             # AppShell, BottomNav, MapView, BookingCard, ui…
│   ├── data/barbershops.ts     # 6 barberías, servicios y barberos ficticios
│   ├── lib/                    # fechas, disponibilidad, distancia, cn
│   ├── pages/                  # una pantalla por ruta
│   ├── pwa/InstallPrompt.tsx   # beforeinstallprompt + instrucciones iOS
│   ├── store/BookingsContext.tsx
│   ├── ui/ToastContext.tsx
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts              # react + tailwind + VitePWA
└── tsconfig*.json
```

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

## Datos simulados (importante)

No hay backend conectado todavía. `src/api/mockApi.ts`:

- Persiste usuarios, sesión y reservas en `localStorage` (`barberapp.*.v1`).
- Simula latencia y comprueba solapes al crear una reserva.
- Genera ocupación determinista por barbero y día para que el mapa de huecos sea realista.
- Incluye reservas semilla (cliente y agenda del barbero) que se regeneran si no hay citas futuras.

Para conectar la API real (Django + Django REST Framework) basta con sustituir las funciones de
`mockApi` por `fetch('/api/...')`; el proxy de Vite ya apunta a `http://localhost:8000`.

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Desarrollo con HMR en el puerto 5173 |
| `npm run build` | Typecheck (`tsc -b`) + build de producción + service worker |
| `npm run preview` | Sirve el build (ideal para probar la instalación PWA) |

## Limitaciones conocidas

- El pago se realiza en la barbería: no hay pasarela de pago.
- El alta de barberías y barberos se hará desde el panel de administración (Django Admin), fuera de
  este frontend.
- Las notificaciones push y la geolocalización real del usuario quedan como ampliación futura; la
  distancia se calcula desde una posición fija del centro de Madrid.
