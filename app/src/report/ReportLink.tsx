import { ShieldAlert } from 'lucide-react'

/** "I think I've been scammed" under a concept-look app bar, the same entry the Sound look has. */
export function ReportLink({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-7 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-[13px] font-semibold text-ink-2 ring-1 ring-line transition hover:bg-slate-200"
    >
      <ShieldAlert size={14} className="text-danger" aria-hidden />
      I think I've been scammed
    </button>
  )
}
