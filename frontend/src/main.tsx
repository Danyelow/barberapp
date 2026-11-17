import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './auth/AuthContext'
import { BookingsProvider } from './store/BookingsContext'
import { ToastProvider } from './ui/ToastContext'
import { ViewModeProvider } from './layout/ViewModeContext'
import { ThemeProvider } from './theme/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ViewModeProvider>
          <ToastProvider>
            <AuthProvider>
              <BookingsProvider>
                <App />
              </BookingsProvider>
            </AuthProvider>
          </ToastProvider>
        </ViewModeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
