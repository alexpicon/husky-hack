import type { ReactNode } from 'react'

export type Tone = 'neutral' | 'brand' | 'safe' | 'warn' | 'danger'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-ink-2 ring-slate-200',
  brand: 'bg-brand-soft text-brand ring-indigo-200',
  safe: 'bg-safe-soft text-safe ring-teal-200',
  warn: 'bg-warn-soft text-warn ring-amber-200',
  danger: 'bg-danger-soft text-danger ring-rose-200',
}

export const toneText: Record<Tone, string> = {
  neutral: 'text-ink-2',
  brand: 'text-brand',
  safe: 'text-safe',
  warn: 'text-warn',
  danger: 'text-danger',
}

export const toneDot: Record<Tone, string> = {
  neutral: 'bg-slate-400',
  brand: 'bg-brand',
  safe: 'bg-teal-500',
  warn: 'bg-amber-500',
  danger: 'bg-rose-500',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'safe' | 'ghost'
  size?: 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
}

const buttonVariants = {
  primary: 'bg-ink text-white hover:bg-slate-800 shadow-sm',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-slate-50',
  danger: 'bg-danger text-white hover:bg-rose-800 shadow-sm',
  safe: 'bg-safe text-white hover:bg-teal-800 shadow-sm',
  ghost: 'text-ink-2 hover:bg-slate-100',
}

export function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  children,
  className = '',
}: ButtonProps) {
  const sizing = size === 'lg' ? 'h-12 px-5 text-base rounded-2xl' : 'h-9 px-3.5 text-sm rounded-xl'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${sizing} ${buttonVariants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white shadow-float ring-1 ring-line/70 ${className}`}>
      {children}
    </div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">
      {children}
    </div>
  )
}

/** Cites the kit row a fact on screen comes from. */
export function Source({ ids }: { ids: string | string[] }) {
  const list = Array.isArray(ids) ? ids : [ids]
  return (
    <span
      className="font-mono text-[10px] text-ink-3"
      title="Row in HuskyHack_Synthetic_Events_v2.csv"
    >
      {list.join(' · ')}
    </span>
  )
}
