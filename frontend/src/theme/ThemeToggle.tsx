import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeContext'
import { cn } from '../lib/cn'

export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string
  showLabel?: boolean
}) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-theme-toggle=""
      aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl font-semibold transition',
        showLabel
          ? 'w-full px-2.5 py-2 text-left text-xs text-ink-500 hover:bg-ink-100 hover:text-ink-800'
          : 'size-9 justify-center text-ink-600 ring-1 ring-ink-200 hover:bg-ink-100 hover:text-ink-900',
        className,
      )}
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      {showLabel ? <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span> : null}
    </button>
  )
}
