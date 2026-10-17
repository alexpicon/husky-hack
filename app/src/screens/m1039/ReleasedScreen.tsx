import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { Badge, Source } from '../../ui/primitives'
import { clock, money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { ReleasedSound } from './ReleasedSound'
import { facts, railLabel } from './facts'
import { DetailRow, MEMO, RecipientRow } from './parts'

export function ReleasedScreen() {
  return useLook() === 'sound' ? <ReleasedSound /> : <ConceptReleasedScreen />
}

function ConceptReleasedScreen() {
  const { payment, recipientAdded } = facts
  return (
    <div className="flex min-h-full flex-col bg-linear-to-b from-safe-soft via-white to-white px-5 pt-8 pb-6">
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="grid size-16 place-items-center rounded-full bg-safe text-white shadow-float ring-8 ring-teal-100"
        >
          <Check size={30} strokeWidth={3} />
        </motion.span>
        <h2 className="mt-5 font-display text-[34px] leading-[1.05] tracking-tight text-ink">
          Your payment is on its way
        </h2>
        <p className="mt-2 text-[17px] text-balance text-ink-2">Thanks for confirming. That's all we needed.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 rounded-3xl bg-white p-5 shadow-float ring-1 ring-line/70"
      >
        <div className="flex items-baseline justify-between">
          <span className="num text-[32px] leading-none font-semibold tracking-tight text-ink">
            {money(payment.amount)}
          </span>
          <Badge tone="safe">Same day</Badge>
        </div>
        <div className="mt-4">
          <RecipientRow addedAt={`today, ${clock(recipientAdded.at)}`} source={recipientAdded.id} />
        </div>
        <dl className="mt-3 divide-y divide-line border-t border-line">
          <DetailRow label="Memo">{MEMO}</DetailRow>
          <DetailRow label="Sent by">{railLabel(payment.rail)}</DetailRow>
          <DetailRow label="Arrives">Today</DetailRow>
        </dl>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-[12px] text-ink-3">{payment.paymentId}</span>
          <Source ids={payment.id} />
        </div>
      </motion.div>

      <p className="mt-auto pt-5 text-center text-[16px] text-ink-3">
        You're all set. Nothing else to do.
      </p>
    </div>
  )
}
