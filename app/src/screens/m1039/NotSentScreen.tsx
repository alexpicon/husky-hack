import { motion } from 'motion/react'
import { Badge, Source } from '../../ui/primitives'
import { clock, money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { facts, railLabel } from './facts'
import { NotSentSound } from './NotSentSound'
import { kept, type KeptAnswer } from './outcomes'
import { DetailRow, MEMO, RecipientRow } from './parts'

/** The rent after an answer that keeps it: stopped after No, still paused otherwise. */
export function NotSentScreen({ answer }: { answer: KeptAnswer }) {
  return useLook() === 'sound' ? <NotSentSound answer={answer} /> : <ConceptNotSentScreen answer={answer} />
}

function ConceptNotSentScreen({ answer }: { answer: KeptAnswer }) {
  const { payment, recipientAdded } = facts
  const copy = kept[answer]
  const Icon = copy.icon
  return (
    <div className="flex min-h-full flex-col bg-linear-to-b from-brand-soft via-white to-white px-5 pt-8 pb-6">
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="grid size-16 place-items-center rounded-full bg-brand text-white shadow-float ring-8 ring-indigo-100"
        >
          <Icon size={30} strokeWidth={2.4} />
        </motion.span>
        <h2 className="mt-5 font-display text-[34px] leading-[1.05] tracking-tight text-balance text-ink">
          {copy.title}
        </h2>
        <p className="mt-2 text-[17px] text-balance text-ink-2">{copy.body}</p>
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
          <Badge tone="warn">
            <span className="whitespace-nowrap">Not sent</span>
          </Badge>
        </div>
        <div className="mt-4">
          <RecipientRow addedAt={`today, ${clock(recipientAdded.at)}`} source={recipientAdded.id} />
        </div>
        <dl className="mt-3 divide-y divide-line border-t border-line">
          <DetailRow label="Memo">{MEMO}</DetailRow>
          <DetailRow label="Pay by">{railLabel(payment.rail)}</DetailRow>
          <DetailRow label="Status">{copy.status}</DetailRow>
        </dl>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-[12px] text-ink-3">{payment.paymentId}</span>
          <Source ids={payment.id} />
        </div>
      </motion.div>
    </div>
  )
}
