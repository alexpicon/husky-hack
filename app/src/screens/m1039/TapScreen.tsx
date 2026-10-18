import { useState, type ReactNode } from 'react'
import { Check, ChevronLeft, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { Source } from '../../ui/primitives'
import { clock, money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { noAnswerOnText, tapReplies, type TapAnswer } from './answers'
import { facts } from './facts'
import { SoundMark } from './parts'

function Bubble({ delay, mine = false, children }: { delay: number; mine?: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.25 }}
      className={`max-w-[262px] rounded-[22px] px-4 py-2.5 text-[16px] leading-snug ${mine ? 'self-end rounded-br-md bg-brand text-white' : 'self-start rounded-bl-md bg-slate-100 text-ink'}`}
    >
      {children}
    </motion.div>
  )
}

const secondary =
  'h-12 w-full rounded-2xl bg-white text-[16px] font-semibold text-ink ring-1 ring-line ring-inset transition hover:bg-slate-50 active:scale-[0.98]'

/**
 * The text to M1039's unchanged phone. Every answer has an outcome; "Yes" releases the rent.
 * `answered` starts the thread after an answer, for a still frame or a render test.
 */
export function TapScreen({ answered = null }: { answered?: TapAnswer | null }) {
  const { next } = useStory()
  const [answer, setAnswer] = useState<TapAnswer | null>(answered)
  const { payment } = facts
  const sender = useLook() === 'sound' ? 'Sound Credit Union' : 'Sound'
  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="relative flex flex-col items-center border-b border-line/70 bg-slate-50/80 pt-1 pb-3">
        <ChevronLeft size={24} className="absolute top-3 left-4 text-brand" aria-hidden />
        <SoundMark size={44} />
        <span className="mt-1 text-[13px] font-medium text-ink">{sender}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pt-4">
        <div className="mb-2 flex items-baseline justify-center gap-2 text-[12px] font-medium text-ink-3">
          <span>Text Message · Today {clock(payment.at)}</span>
          <Source ids={payment.id} />
        </div>
        <Bubble delay={0.1}>
          <span className="font-semibold">{sender}:</span> Was this you?{' '}
          <span className="num font-semibold">{money(payment.amount)}</span> to a new recipient,
          today at {clock(payment.at)}.
        </Bubble>
        <Bubble delay={0.35}>
          Tap Yes and we'll release it for processing. If a website or caller told you to expect this
          text, tap No. We'll never ask for your password or a code.
        </Bubble>
        {answer && (
          <>
            <Bubble delay={0} mine>
              {tapReplies[answer].said}
            </Bubble>
            <Bubble delay={0.3}>{tapReplies[answer].reply}</Bubble>
          </>
        )}
      </div>

      {!answer && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col gap-2.5 px-4 pt-4"
        >
          <button
            type="button"
            onClick={next}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-safe text-[17px] font-semibold text-white shadow-float transition hover:bg-teal-800 active:scale-[0.98]"
          >
            <Check size={20} strokeWidth={2.6} />
            Yes, it was me
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setAnswer('no')} className={secondary}>
              {tapReplies.no.said}
            </button>
            <button type="button" onClick={() => setAnswer('not-sure')} className={secondary}>
              {tapReplies['not-sure'].said}
            </button>
          </div>
        </motion.div>
      )}
      <p className="flex gap-2 px-5 pt-3 pb-6 text-[14px] leading-snug text-ink-3">
        <Clock size={15} className="mt-0.5 shrink-0" aria-hidden />
        {noAnswerOnText}
      </p>
    </div>
  )
}
