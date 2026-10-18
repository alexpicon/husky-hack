import { motion } from 'motion/react'
import { CircleX, Clock, LifeBuoy, MessageCircle } from 'lucide-react'
import { ReportRow } from '../../report/ReportRow'
import { Tablet } from '../../ui/devices'
import { useLook } from '../../ui/look'
import { AUTONOMY, callBack, checkBackBy, HOLD_PROMISE, readTaps, replies } from './copy'
import { DecideSound } from './DecideSound'
import { dollars, lindaFacts } from './facts'
import { caseActions, useLindaCase } from './lindaCase'
import { ENDING_ICON, outcomeCopy, SEQUEL } from './outcomes'
import { PausedStatus, TabletHeader } from './parts'

function DecideConcept({ at }: { at: Date }) {
  const f = lindaFacts()
  const { state, update } = useLindaCase()
  const ending = state.outcome && outcomeCopy(state.outcome)
  const call = callBack(readTaps(state.taps))
  const Icon = state.outcome && ENDING_ICON[state.outcome.kind]

  return (
    <Tablet caption={ending ? 'Branch tablet - how her wire ended' : 'Branch tablet - Linda decides'}>
      <div className="flex min-h-full flex-col gap-4 px-6 py-5">
        <TabletHeader
          right={
            ending && Icon ? (
              <>
                <Icon size={16} className="text-brand" aria-hidden />
                {ending.status} · <span className="num font-mono">{dollars(f.wire.amount)}</span>
              </>
            ) : (
              <PausedStatus />
            )
          }
        />
        {ending && Icon ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 rounded-3xl bg-white p-5 ring-1 ring-line"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Icon size={24} aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-[32px] leading-[1.05] text-ink">{ending.title}</h2>
                <p className="mt-2 text-[17px] leading-snug text-ink-2">{ending.body}</p>
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3 rounded-2xl bg-warn-soft px-4 py-3.5 text-[17px] leading-snug font-semibold text-ink ring-1 ring-amber-200 ring-inset"
            >
              <MessageCircle size={20} className="mt-0.5 shrink-0 text-warn" aria-hidden />
              {SEQUEL}
            </motion.p>
          </>
        ) : (
          <>
            <div>
              <h2 className="font-display text-[32px] leading-tight text-ink">
                What would you like to do?
              </h2>
              <p className="mt-1 text-[17px] leading-snug text-ink-2">
                <strong className="text-ink">{call.lead}</strong> {call.rest}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => update((c) => caseActions.decide(c, 'cancelled', at))}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
              >
                <CircleX size={18} aria-hidden /> Cancel this wire
              </button>
              <button
                type="button"
                onClick={() => update((c) => caseActions.decide(c, 'help', at))}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-ink ring-1 ring-slate-300 transition ring-inset hover:bg-slate-50 active:scale-[0.99]"
              >
                <LifeBuoy size={18} className="text-brand" aria-hidden /> Help me check this
              </button>
            </div>
            <p className="flex items-start gap-3 rounded-2xl bg-warn-soft px-4 py-3 text-[16px] leading-snug text-ink ring-1 ring-amber-200 ring-inset">
              <Clock size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />
              <span>
                <strong>{checkBackBy()}.</strong> {HOLD_PROMISE}
              </span>
            </p>
            <div className="mt-auto flex items-center justify-between gap-3">
              <p
                className={`text-base font-semibold ${state.wantsToSend ? 'text-safe' : 'text-ink'}`}
                aria-live="polite"
              >
                {state.wantsToSend ? replies.staff : AUTONOMY}
              </p>
              {!state.wantsToSend && (
                <button
                  type="button"
                  onClick={() => update(caseActions.askToSend)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[15px] font-semibold text-ink-2 underline decoration-slate-300 underline-offset-4 transition hover:bg-slate-100"
                >
                  <MessageCircle size={16} aria-hidden />
                  I still want to send - talk to staff
                </button>
              )}
            </div>
          </>
        )}
        <ReportRow channel="branch" edge="-mx-6 -mb-5 px-6" />
      </div>
    </Tablet>
  )
}

/** Step five: Linda's choices while the wire is paused, then the ending once there is one. */
export function Decide({ at }: { at: Date }) {
  return useLook() === 'sound' ? <DecideSound at={at} /> : <DecideConcept at={at} />
}
