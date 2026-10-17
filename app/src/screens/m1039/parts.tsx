import type { ReactNode } from 'react'
import { ChevronLeft, House } from 'lucide-react'
import { Source } from '../../ui/primitives'

/** The member's own words from the key: "paid first month + deposit to a new landlord". */
export const RECIPIENT_LABEL = 'Your new landlord'
export const MEMO = 'First month + deposit'

export function SoundMark({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-[30%] bg-linear-to-br from-indigo-500 to-brand text-white shadow-sm"
    >
      <svg viewBox="0 0 20 20" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M3 12c2-4 4-4 6 0s4 4 6 0" />
        <path d="M3 7c2-3 4-3 6 0s4 3 6 0" opacity="0.55" />
      </svg>
    </span>
  )
}

export function AppBar({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-1 pb-3">
      <button
        type="button"
        aria-label="Back"
        className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-slate-100"
      >
        <ChevronLeft size={22} />
      </button>
      <span className="flex-1 text-center text-[16px] font-semibold text-ink">{title}</span>
      <span className="grid size-9 place-items-center">
        <SoundMark size={24} />
      </span>
    </div>
  )
}

export function RecipientRow({ addedAt, source, badge }: { addedAt: string; source: string; badge?: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
        <House size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[17px] font-semibold text-ink">{RECIPIENT_LABEL}</div>
        <div className="flex flex-wrap items-baseline gap-x-2 text-[15px] text-ink-3">
          <span>Added {addedAt}</span>
          <Source ids={source} />
        </div>
      </div>
      {badge}
    </div>
  )
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-[15px] text-ink-3">{label}</dt>
      <dd className="text-right text-[16px] font-medium text-ink">{children}</dd>
    </div>
  )
}
