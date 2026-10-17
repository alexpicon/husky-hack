import type { ReactNode } from 'react'
import { Check, ChevronLeft, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { Source } from '../../ui/primitives'
import { clock, money } from '../../ui/format'
import { facts } from './facts'
import { SoundMark } from './parts'

function Bubble({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.25 }}
      className="max-w-[262px] rounded-[22px] rounded-bl-md bg-slate-100 px-4 py-2.5 text-[16px] leading-snug text-ink"
    >
      {children}
    </motion.div>
  )
}

export function TapScreen() {
  const { next } = useStory()
  const { payment } = facts
  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="relative flex flex-col items-center border-b border-line/70 bg-slate-50/80 pt-1 pb-3">
        <button
          type="button"
          aria-label="Back to messages"
          className="absolute top-2 left-3 grid size-9 place-items-center rounded-full text-brand hover:bg-slate-100"
        >
          <ChevronLeft size={24} />
        </button>
        <SoundMark size={44} />
        <span className="mt-1 text-[13px] font-medium text-ink">Sound</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pt-4">
        <div className="mb-2 flex items-baseline justify-center gap-2 text-[12px] font-medium text-ink-3">
          <span>Text Message · Today {clock(payment.at)}</span>
          <Source ids={payment.id} />
        </div>
        <Bubble delay={0.1}>
          <span className="font-semibold">Sound:</span> Was this you?{' '}
          <span className="num font-semibold">{money(payment.amount)}</span> to a new recipient,
          today at {clock(payment.at)}.
        </Bubble>
        <Bubble delay={0.35}>
          Tap Yes and it goes right away. We'll never ask for your password or a code.
        </Bubble>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col gap-2.5 px-4 pt-4 pb-6"
      >
        <button
          type="button"
          onClick={next}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-safe text-[17px] font-semibold text-white shadow-float transition hover:bg-teal-800 active:scale-[0.98]"
        >
          <Check size={20} strokeWidth={2.6} />
          Yes, it was me
        </button>
        <button
          type="button"
          className="h-12 w-full rounded-2xl bg-white text-[16px] font-semibold text-ink ring-1 ring-line ring-inset transition hover:bg-slate-50"
        >
          No
        </button>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[14px] text-ink-3">
          <Phone size={14} />
          Not sure? Call the number on your card.
        </p>
      </motion.div>
    </div>
  )
}
