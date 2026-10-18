import { ChevronRight, Flag } from 'lucide-react'
import { useReportSheet } from './useReportSheet'

/** "Report a scam" as a row in a text thread from Sound, for a phone with no Sound app open. */
export function ReportRow() {
  const report = useReportSheet()
  if (!report.available) return null
  return (
    <>
      <button
        type="button"
        onClick={report.open}
        className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left ring-1 ring-line transition hover:bg-slate-50 active:scale-[0.99]"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
          <Flag size={18} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold text-ink">Report a scam</span>
          <span className="block text-[13px] text-ink-3">I think I've been scammed</span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-ink-3" aria-hidden />
      </button>
      {report.sheet}
    </>
  )
}
