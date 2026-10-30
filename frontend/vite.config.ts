import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'BarberApp · Reserva tu barbería',
        short_name: 'BarberApp',
        description:
          'Encuentra barberías cerca de ti, consulta servicios y reserva cita con tu barbero favorito.',
        lang: 'es',
        dir: 'ltr',
        theme_color: '#1c1a17',
        background_color: '#f7f6f4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['lifestyle', 'shopping'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Mis citas',
            short_name: 'Citas',
            url: '/citas',
            description: 'Consulta tus próximas reservas',
          },
          {
            name: 'Buscar barberías',
            short_name: 'Buscar',
            url: '/mapa',
            description: 'Explora el mapa de barberías',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    port: 5173,
    // Si el puerto está ocupado, falla en vez de cambiar a otro (evita "localhost:5173 no responde")
    strictPort: true,
    proxy: {
      // Cuando exista la API (Django) las llamadas /api/* se reenviarán aquí
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
