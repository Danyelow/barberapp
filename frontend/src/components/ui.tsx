import { useEffect, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Star, X } from 'lucide-react'
import { cn } from '../lib/cn'

/* ------------------------------ Button ------------------------------ */

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-ink-900 text-white shadow-sm hover:bg-ink-800 active:bg-ink-950',
  accent: 'bg-brand-500 text-ink-950 shadow-sm hover:bg-brand-400 active:bg-brand-600',
  secondary: 'bg-white text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'text-ink-800 ring-1 ring-ink-300 hover:bg-ink-100',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-xl px-3 text-sm',
  md: 'h-11 gap-2 rounded-2xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-2xl px-5 text-base',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  full?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  full = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        buttonVariants[variant],
        buttonSizes[size],
        full && 'w-full',
        className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  )
}

/* ------------------------------ Field ------------------------------- */

type FieldProps = ComponentProps<'input'> & {
  label: string
  hint?: string
  error?: string
  icon?: ReactNode
}

export function Field({ label, hint, error, icon, className, id, ...props }: FieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          {...props}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-12 w-full rounded-2xl bg-white px-4 text-[15px] text-ink-900 ring-1 ring-ink-200 outline-none transition placeholder:text-ink-400 focus:ring-2',
            Boolean(icon) && 'pl-10',
            error ? 'ring-red-400 focus:ring-red-500' : 'focus:ring-ink-900',
            className,
          )}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
}

/* ------------------------------ Badge ------------------------------- */

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand'

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  brand: 'bg-brand-500/15 text-brand-700',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ------------------------------ Avatar ------------------------------ */

const avatarTones = [
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
  'bg-stone-200 text-stone-700',
]

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const tone = avatarTones[(name.charCodeAt(0) + name.length) % avatarTones.length]
  const sizes = {
    sm: 'size-8 text-[11px]',
    md: 'size-10 text-sm',
    lg: 'size-14 text-lg',
    xl: 'size-20 text-2xl',
  }

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-white/60',
        sizes[size],
        tone,
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

/* ------------------------------ Cover ------------------------------- */

export function Cover({
  src,
  alt,
  name,
  className,
  children,
}: {
  src: string
  alt: string
  name: string
  className?: string
  children?: ReactNode
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-ink-800', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,#4b4842_0%,#1c1a17_60%,#12100e_100%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl font-black tracking-tighter text-white/10">{initials(name)}</span>
      </div>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="relative size-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/15 to-transparent" />
      {children}
    </div>
  )
}

/* ------------------------------ Rating ------------------------------ */

export function Rating({
  value,
  count,
  className,
}: {
  value: number
  count?: number
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', className)}>
      <Star className="size-3.5 fill-brand-400 text-brand-400" aria-hidden />
      <span>{value.toFixed(1)}</span>
      {typeof count === 'number' ? <span className="font-normal opacity-70">({count})</span> : null}
    </span>
  )
}

/* ------------------------------ Sheet ------------------------------- */

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 animate-fade bg-ink-950/55 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-sheet relative w-full max-w-md rounded-t-3xl bg-white p-5 pb-6 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-200" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-full p-2 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-5 flex gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------ Switch ------------------------------ */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition',
        checked ? 'bg-ink-900' : 'bg-ink-200',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow transition',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

/* ---------------------------- Feedback ------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-ink-200/70', className)} />
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink-300 bg-white/60 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-500">{icon}</span>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="max-w-xs text-sm text-ink-500">{message}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
