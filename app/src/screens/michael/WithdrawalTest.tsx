import { Check, TriangleAlert } from 'lucide-react'
import { motion } from 'motion/react'
import type { Look } from '../../ui/look'
import { SOUND } from '../../ui/soundApp'
import { checkActions, TEST_OPTIONS } from './check'
import { useMichaelCheck } from './checkState'
import { WITHDRAWAL_QUESTION } from './facts'
import { ShareToggle } from './parts'

/** The same question the call opens with. */
export const TEST_QUESTION = WITHDRAWAL_QUESTION

/**
 * Before Sound calls: the call's first question, asked once. His answer is final, it never clears
 * the hold, and staff see it only if he shares it. Once he cancels the wire there is no hold and
 * no call, so the buttons lock and the reply about the hold goes.
 */
export function WithdrawalTest({ look }: { look: Look }) {
  const sound = look === 'sound'
  const { state, update } = useMichaelCheck()
  const answer = TEST_OPTIONS.find((o) => o.id === state.test)
  const cancelled = state.wire === 'cancel'
  const card = sound ? 'bg-white shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'bg-slate-50 ring-1 ring-line'
  const accent = sound ? SOUND.action : undefined
  return (
    <section aria-label={TEST_QUESTION} className={`rounded-2xl px-3.5 py-3 ${card}`}>
      <p className="text-[12px] font-bold tracking-wide uppercase" style={{ color: sound ? SOUND.muted : undefined }}>
        {cancelled ? 'Wire cancelled' : 'Before Sound calls you'}
      </p>
      <h3 className="text-[16px] leading-tight font-semibold" style={sound ? { color: SOUND.navy } : undefined}>
        {TEST_QUESTION}
      </h3>
      {answer ? (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3">
            <p className="flex items-center gap-1.5 text-[14px] opacity-80">
              <Check size={15} aria-hidden /> You answered: {answer.label}
            </p>
            <ShareToggle look={look} answered />
          </div>
          {!cancelled && (
            <p
              role="status"
              className={`flex items-start gap-2 text-[14px] leading-snug font-semibold ${answer.id === 'failed' ? 'rounded-xl bg-warn-soft px-3 py-2 text-amber-900 ring-1 ring-amber-200' : ''}`}
            >
              {answer.id === 'failed' && <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden />}
              {answer.reply}
            </p>
          )}
        </motion.div>
      ) : (
        <div className="mt-2 flex gap-2" role="group" aria-label={TEST_QUESTION}>
          {TEST_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={cancelled}
              onClick={() => update((c) => checkActions.test(c, o.id))}
              className={`min-h-10 flex-1 rounded-xl px-2 py-1.5 text-[14px] leading-tight font-semibold transition ${cancelled ? 'cursor-not-allowed opacity-50' : 'active:scale-[0.98]'} ${sound ? 'border-2 bg-white' : `bg-white text-ink ring-1 ring-line ${cancelled ? '' : 'hover:bg-slate-100'}`}`}
              style={sound ? { borderColor: accent, color: accent } : undefined}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
