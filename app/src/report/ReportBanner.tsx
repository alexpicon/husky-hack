import { Flag, Undo2 } from 'lucide-react'
import { motion } from 'motion/react'
import { CALLBACK_MINUTES } from './kitFacts'
import { callbackBy, reportRef, staffPausedLine, useReport, type ReportChannel } from './report'

const REPORTED: Record<ReportChannel, string> = {
  app: 'Scam reported in the app',
  branch: 'Scam reported at the branch',
  text: 'Scam reported by text',
}

/** The member's report as it lands on the staff case, the same moment it is filed anywhere. */
export function ReportBanner({ member }: { member: string }) {
  const { state, requestRecall } = useReport()
  const report = state.report
  if (!report || report.member !== member) return null
  const requested = report.stage !== 'received'
  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label="Scam reported"
      className="flex flex-wrap items-center gap-4 rounded-2xl bg-danger-soft p-4 ring-1 ring-rose-200"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-danger ring-1 ring-rose-200">
        <Flag size={22} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[16px] font-semibold text-ink">
            {/* A window still on an older build syncs reports without a channel. */}
            {REPORTED[report.channel] ?? REPORTED.app}
          </span>
          <span className="font-mono text-xs text-ink-3">{reportRef(report)}</span>
        </div>
        <div className="mt-0.5 text-[14px] text-ink-2">
          Reported at <span className="num font-semibold text-ink">{report.clock}</span>.{' '}
          {staffPausedLine()} Call back by{' '}
          <span className="num font-semibold text-ink">{callbackBy(report, CALLBACK_MINUTES)}</span>, on a
          number on file before any recent change.
        </div>
      </div>
      <button
        type="button"
        onClick={requestRecall}
        disabled={requested}
        className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-default ${requested ? 'bg-white text-safe ring-1 ring-teal-200 ring-inset' : 'bg-danger text-white shadow-sm hover:bg-rose-800'}`}
      >
        <Undo2 size={16} aria-hidden />
        {requested ? 'Recall requested' : 'Request recall'}
      </button>
    </motion.section>
  )
}
