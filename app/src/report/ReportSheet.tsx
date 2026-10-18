import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Check, HeartHandshake, TriangleAlert } from 'lucide-react'
import { motion } from 'motion/react'
import { clock } from '../ui/format'
import { CALLBACK_MINUTES, p2pRecalls } from './kitFacts'
import { callbackBy, pausedLine, reportRef, timeOfStoryClock, useReport, type ReportStage } from './report'

const ORDER: ReportStage[] = ['received', 'recall-requested', 'recovered']

function Milestone({ done, title, status, children }: { done: boolean; title: string; status: string; children?: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${done ? 'bg-safe text-white' : 'bg-white text-ink-3 ring-2 ring-slate-300 ring-inset'}`}
        aria-hidden
      >
        {done && <Check size={14} strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[16px] font-semibold text-ink">{title}</span>
          <span className={`text-[13px] font-semibold ${done ? 'text-safe' : 'text-ink-3'}`}>{status}</span>
        </div>
        {children && <p className="mt-0.5 text-[14px] leading-snug text-ink-2">{children}</p>}
      </div>
    </li>
  )
}

/**
 * The one screen behind "I think I've been scammed", as a sheet over whatever phone it opens on.
 * It positions against the phone's screen, its nearest positioned ancestor.
 */
export function ReportSheet({ onClose }: { onClose: () => void }) {
  const { state } = useReport()
  const titleId = useId()
  const done = useRef<HTMLButtonElement>(null)
  useEffect(() => done.current?.focus({ preventScroll: true }), [])

  const report = state.report
  if (!report) return null
  const reached = ORDER.indexOf(report.stage)
  const recall = reached >= 1
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="absolute inset-0 z-[15] flex flex-col justify-end text-ink"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-950/45"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative max-h-[calc(100%-52px)] overflow-y-auto rounded-t-[28px] bg-white px-5 pt-2.5 pb-6 shadow-[0_-8px_30px_rgb(15_23_42/0.25)]"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-300" aria-hidden />
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-safe-soft text-safe ring-1 ring-teal-200">
            <HeartHandshake size={24} aria-hidden />
          </span>
          <h2 id={titleId} className="text-[22px] leading-tight font-bold tracking-tight">
            Thanks for telling us
          </h2>
        </div>
        <p className="mt-3 text-[15px] leading-snug text-ink-2">
          {pausedLine(reportRef(report))} A specialist will call you on a number you've had with us for
          a while, by <span className="num font-semibold text-ink">{callbackBy(report, CALLBACK_MINUTES)}</span>.
        </p>

        <ol className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-3.5 ring-1 ring-line" aria-label="Your case">
          <Milestone done title="Report received" status={clock(timeOfStoryClock(report.clock))} />
          <Milestone done={recall} title="Recall requested" status={recall ? 'Requested' : 'Next'}>
            We ask the bank that got the money to send it back. The sooner, the better. Asking is not a
            guarantee.
          </Milestone>
          <Milestone done={reached >= 2} title="Money recovered" status={reached >= 2 ? 'Returned' : 'If returned'}>
            Only if that bank sends it back. P2P recalls usually fail: {p2pRecalls.failed} of{' '}
            {p2pRecalls.requested} in the kit.
          </Milestone>
        </ol>

        <p className="mt-3 flex gap-2.5 rounded-2xl bg-warn-soft px-3.5 py-3 text-[14px] leading-snug font-semibold text-amber-900 ring-1 ring-amber-200">
          <TriangleAlert size={18} className="mt-px shrink-0 text-warn" aria-hidden />
          Anyone who asks for a fee to get your money back is a scammer.
        </p>

        <button
          ref={done}
          type="button"
          onClick={onClose}
          className="mt-4 h-12 w-full rounded-2xl bg-ink text-[17px] font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
        >
          Done
        </button>
      </motion.div>
    </div>
  )
}
