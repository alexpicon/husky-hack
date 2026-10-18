import { ChevronRight, Flag } from 'lucide-react'
import { useReportSheet } from './useReportSheet'

/**
 * "Report a scam" pinned to the bottom of a text thread from Sound, for a phone with no Sound
 * app open, or of a branch tablet screen. It stays in view however long the screen above it is.
 * `edge` cancels the parent's side padding (and bottom padding, if any) so the row spans the screen.
 */
export function ReportRow({ edge = '-mx-4 px-4' }: { edge?: string }) {
  const report = useReportSheet()
  if (!report.available) return null
  return (
    <>
      <div className={`sticky bottom-0 z-[5] border-t border-line bg-white/95 pt-2 pb-3 backdrop-blur ${edge}`}>
        <button
          type="button"
          onClick={report.open}
          className="flex w-full items-center gap-3 rounded-2xl bg-white px-3.5 py-2 text-left ring-1 ring-line transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
            <Flag size={16} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[15px] font-semibold text-ink">Report a scam</span>
            <span className="block text-[13px] text-ink-3">I think I've been scammed</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-ink-3" aria-hidden />
        </button>
      </div>
      {report.sheet}
    </>
  )
}
