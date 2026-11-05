# BarberApp · Frontend (PWA)

Aplicación web progresiva **mobile first** para localizar peluquerías de hombres y de mujeres,
consultar servicios y reservar cita con el profesional que elijas. Incluye panel de agenda para
barberos.

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

| Rol | Email | Contraseña | Género autodeclarado |
|---|---|---|---|
| Cliente | `cliente@barberapp.dev` | `123456` | Mujer |
| Barbero | `barbero@barberapp.dev` | `123456` | Hombre |

También puedes registrarte como cliente: el formulario pide nombre, email, teléfono, género y
contraseña, y la cuenta se guarda solo en tu navegador. El registro de barberos no está disponible
en la app: esas cuentas se crean desde la administración. La pantalla de login no muestra botones de
demo, pero las cuentas de la tabla siguen existiendo para que las escribas manualmente.
**No introduzcas datos personales reales** (el repositorio es público).

## Funcionalidad

- **Acceso**: sin sesión solo se muestran `/entrar` y `/registro`. Cualquier enlace profundo
  redirige al login y vuelve a la ruta solicitada después de entrar.
- **Registro solo para clientes**: el alta crea siempre cuentas `cliente`; las de barbero se
  gestionan desde la administración. El género es obligatorio y se usa para aplicar restricciones.
- **Inicio**: buscador por peluquería / servicio / zona, filtro por tipo (hombres / mujeres), tarjetas
  con distancia, rating, precio desde y estado (abierto/cerrado), y recordatorio de la próxima cita.
  Al entrar se solicita la ubicación y los resultados se ordenan por cercanía real.
- **Mapa**: al abrir la pantalla pide geolocalización, centra el mapa en la persona usuaria, ordena
  las peluquerías por distancia y muestra la ficha flotante con enlace a la reserva. Incluye estados
  de permiso denegado, error, reintento y respaldo en el centro de Sevilla.
- **Detalle de peluquería**: portada, descripción, tipo de peluquería, servicios con duración y
  precio, equipo, horario, llamar, compartir y favorito. Los servicios de barba se ocultan de la
  lista de servicios y del flujo de reserva a las clientas.
- **Reserva en 4 pasos**: servicio → profesional → día y hora → confirmación.
  - Disponibilidad calculada en cliente: horario de apertura, duración del servicio, días cerrados,
    citas ya ocupadas y horas pasadas.
  - Notas opcionales para el profesional y confirmación con resumen.
  - Los servicios marcados como `onlyForMen` solo se ofrecen a quienes se identifican como hombre.
- **Mis citas**: próximas e historial, cancelación con confirmación y repetición de una reserva.
- **Agenda (barbero)**: citas de hoy, próximas e historial; confirmar, completar o cancelar;
  contacto directo con el cliente; métricas de hoy, pendientes e ingresos.
- **Perfil**: datos de la cuenta, preferencias, instalación de la PWA, restablecer datos de demo y
  cierre de sesión.
- **Autenticación**: login, sesión persistente, registro de clientes y redirecciones para que un
  usuario con sesión no vuelva a las pantallas de acceso.

## Rutas

Todas las rutas salvo las dos de autenticación requieren sesión.

| Ruta | Descripción |
|---|---|
| `/` | Descubrir barberías |
| `/mapa` | Mapa interactivo con geolocalización (`?shop=id` preselecciona una barbería) |
| `/barberia/:id` | Detalle de barbería |
| `/barberia/:id/reservar` | Flujo de reserva (`?servicio=` y `?barbero=` preseleccionan) |
| `/citas` | Mis citas |
| `/agenda` | Panel del barbero |
| `/perfil` | Cuenta y ajustes |
| `/entrar`, `/registro` | Autenticación (solo sin sesión) |

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
│   ├── auth/                   # AuthContext, RequireAuth, PublicOnly
│   ├── components/             # AppShell, BottomNav, MapView, BookingCard, ui…
│   ├── data/barbershops.ts     # 10 peluquerías de Sevilla, servicios y barberos ficticios
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

- Persiste usuarios, sesión, reservas y la última ubicación en `localStorage`
  (`barberapp.*.v1`).
- Simula latencia, comprueba solapes y rechaza reservas de servicios de barba si el género no es
  `hombre` (la UI también los oculta).
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
- La geolocalización requiere `https` o `localhost` y permiso del navegador. Si se deniega, la app
  sigue funcionando con el centro de Sevilla como posición de respaldo.
- Las notificaciones push quedan como ampliación futura.
