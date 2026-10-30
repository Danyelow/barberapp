import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell, ScrollToTop } from './components/AppShell'
import { RequireAuth } from './auth/RequireAuth'
import { DiscoverPage } from './pages/DiscoverPage'
import { BarbershopPage } from './pages/BarbershopPage'
import { BookingsPage } from './pages/BookingsPage'
import { AgendaPage } from './pages/AgendaPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { NotFoundPage } from './pages/NotFoundPage'

// El mapa (Leaflet) y el flujo de reserva se cargan aparte: primera carga más ligera.
const MapPage = lazy(() => import('./pages/MapPage').then((module) => ({ default: module.MapPage })))
const BookingPage = lazy(() =>
  import('./pages/BookingPage').then((module) => ({ default: module.BookingPage })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-stone-50">
      <span
        aria-label="Cargando"
        className="size-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900"
      />
    </div>
  )
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DiscoverPage />} />
          <Route
            path="mapa"
            element={
              <Suspense fallback={<RouteFallback />}>
                <MapPage />
              </Suspense>
            }
          />
          <Route
            path="citas"
            element={
              <RequireAuth>
                <BookingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="agenda"
            element={
              <RequireAuth>
                <AgendaPage />
              </RequireAuth>
            }
          />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="barberia/:id" element={<BarbershopPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="barberia/:id/reservar"
          element={
            <RequireAuth>
              <Suspense fallback={<RouteFallback />}>
                <BookingPage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="entrar" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />
      </Routes>
    </>
  )
}

export default App
