import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { toneDot, type Tone } from '../../ui/primitives'

export function Panel({
  title,
  icon,
  aside,
  delay = 0,
  className = '',
  children,
}: {
  title: string
  icon?: ReactNode
  aside?: ReactNode
  delay?: number
  className?: string
  children: ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)] ring-1 ring-line ${className}`}
    >
      <header className="mb-3 flex items-center gap-2">
        {icon && <span className="text-ink-3">{icon}</span>}
        <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">{title}</h3>
        {aside && <div className="ml-auto min-w-0 pl-2 text-right">{aside}</div>}
      </header>
      {children}
    </motion.section>
  )
}

const pillTone: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-ink-2 ring-slate-200',
  brand: 'bg-brand-soft text-brand ring-indigo-200',
  safe: 'bg-safe-soft text-safe ring-teal-200',
  warn: 'bg-warn-soft text-warn ring-amber-200',
  danger: 'bg-danger-soft text-danger ring-rose-200',
}

export function StatusPill({ tone, live, children }: { tone: Tone; live?: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 ring-inset ${pillTone[tone]}`}
    >
      <span className="relative flex size-2">
        {live && (
          <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${toneDot[tone]}`} />
        )}
        <span className={`relative inline-flex size-2 rounded-full ${toneDot[tone]}`} />
      </span>
      {children}
    </span>
  )
}

export function CaseHeader({
  name,
  member,
  kind,
  caseId,
  pill,
}: {
  name: string
  member: string
  kind: string
  caseId?: string
  pill: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-lg font-semibold text-white shadow-sm">
        {name.startsWith('Member') ? member.slice(-2) : name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-ink">{name}</h2>
          <span className="font-mono text-xs text-ink-3">{member}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3">
          <span>{kind}</span>
          <span aria-hidden>·</span>
          <span className="font-mono text-xs">{caseId ?? 'No case yet'}</span>
        </div>
      </div>
      {pill}
    </div>
  )
}

export type ActionLook = 'off' | 'on' | 'recommended' | 'done'

const recommendedStyle: Record<'danger' | 'safe' | 'warn' | 'brand', string> = {
  danger: 'bg-danger text-white shadow-lg shadow-rose-900/20 hover:bg-rose-800',
  safe: 'bg-safe text-white shadow-lg shadow-teal-900/20 hover:bg-teal-800',
  warn: 'bg-warn text-white shadow-lg shadow-amber-900/20 hover:bg-amber-800',
  brand: 'bg-brand text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-800',
}

export function ActionButton({
  look,
  accent,
  icon,
  label,
  hint,
  doneLabel,
  onClick,
}: {
  look: ActionLook
  accent: keyof typeof recommendedStyle
  icon: ReactNode
  label: string
  hint?: string
  doneLabel?: string
  onClick?: () => void
}) {
  const style =
    look === 'recommended'
      ? recommendedStyle[accent]
      : look === 'done'
        ? 'bg-safe-soft text-safe ring-1 ring-inset ring-teal-200'
        : 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-slate-50'
  return (
    <button
      type="button"
      disabled={look === 'off' || look === 'done'}
      onClick={onClick}
      className={`relative flex h-full w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left transition active:scale-[0.99] disabled:cursor-default ${look === 'off' ? 'opacity-40' : ''} ${style}`}
    >
      {look === 'recommended' && (
        <span className="absolute -top-2 right-3 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase shadow-sm">
          Recommended
        </span>
      )}
      <span className="mt-0.5 shrink-0">{look === 'done' ? <Check size={18} /> : icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-semibold">
          {look === 'done' ? (doneLabel ?? label) : label}
        </span>
        {hint && (
          <span className={`mt-0.5 block text-xs ${look === 'recommended' ? 'text-white/85' : 'text-ink-3'}`}>
            {hint}
          </span>
        )}
      </span>
    </button>
  )
}

export function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="text-ink-3">{label}</span>
      <span className="min-w-0 text-right font-medium text-ink">{children}</span>
    </div>
  )
}
