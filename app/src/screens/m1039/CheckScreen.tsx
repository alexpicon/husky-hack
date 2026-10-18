import { Clock, MessageSquareText, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { CheckSound } from './CheckSound'
import { facts, HOLD_HOURS } from './facts'

export function CheckScreen() {
  return useLook() === 'sound' ? <CheckSound /> : <ConceptCheckScreen />
}

function ConceptCheckScreen() {
  const { next } = useStory()
  const { payment } = facts
  return (
    <div className="flex min-h-full flex-col bg-linear-to-b from-brand-soft via-white to-white px-5 pt-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[36px] leading-[1.05] tracking-tight text-ink">
          One quick check
        </h2>
        <motion.span
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-float ring-1 ring-indigo-100"
        >
          <MessageSquareText size={22} />
        </motion.span>
      </div>
      <p className="mt-2 text-[17px] leading-snug text-ink-2">
        This payment needs a quick yes before{' '}
        <span className="num font-semibold text-ink">{money(payment.amount)}</span> goes. If you
        started it, check your messages from Sound.
      </p>

      <motion.dl
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-5 divide-y divide-line rounded-2xl bg-white ring-1 ring-line"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-[15px] text-ink-2">Payment</dt>
          <dd className="num text-[18px] font-semibold text-ink">{money(payment.amount)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="text-[15px] text-ink-2">Status</dt>
          <dd className="rounded-full bg-brand-soft px-2.5 py-1 text-[13px] font-semibold text-brand ring-1 ring-indigo-100">
            Waiting for your yes
          </dd>
        </div>
      </motion.dl>

      <button
        type="button"
        onClick={next}
        className="mt-5 flex h-14 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-ink text-[17px] font-semibold text-white shadow-float transition hover:bg-slate-800 active:scale-[0.98]"
      >
        <MessageSquareText size={19} />
        Check your messages
      </button>

      <div className="mt-4 space-y-2 text-[16px] leading-snug text-ink-3">
        <p className="flex gap-2">
          <Clock size={16} className="mt-1 shrink-0" />
          Your payment is saved. It can wait up to {HOLD_HOURS} hours.
        </p>
        <p className="flex gap-2">
          <Phone size={16} className="mt-1 shrink-0" />
          No phone handy? Call the number on your card.
        </p>
      </div>
    </div>
  )
}
