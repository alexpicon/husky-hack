import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { Badge, Source } from '../../ui/primitives'
import { clock, money } from '../../ui/format'
import { facts, railLabel } from './facts'
import { AppBar, DetailRow, MEMO, RecipientRow } from './parts'

export function PayScreen() {
  const { next } = useStory()
  const { payment, recipientAdded } = facts
  return (
    <div className="flex min-h-full flex-col bg-white">
      <AppBar title="Pay & transfer" />
      <div className="flex flex-1 flex-col px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-linear-to-b from-slate-50 to-white px-5 pt-6 pb-5 text-center ring-1 ring-line/70"
        >
          <div className="text-[15px] font-medium text-ink-3">You're sending</div>
          <div className="num mt-1 text-[44px] leading-none font-semibold tracking-tight text-ink">
            {money(payment.amount)}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge tone="brand">{railLabel(payment.rail)}</Badge>
            <Source ids={payment.id} />
          </div>
        </motion.div>

        <div className="mt-6 text-[13px] font-semibold tracking-wide text-ink-3 uppercase">To</div>
        <div className="mt-2.5">
          <RecipientRow
            addedAt={`today, ${clock(recipientAdded.at)}`}
            source={recipientAdded.id}
            badge={<Badge>New</Badge>}
          />
        </div>

        <dl className="mt-5 divide-y divide-line border-y border-line">
          <DetailRow label="Memo">{MEMO}</DetailRow>
          <DetailRow label="Arrives">Today</DetailRow>
          <DetailRow label="Payment">
            <span className="font-mono text-[14px]">{payment.paymentId}</span>
          </DetailRow>
        </dl>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={next}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[17px] font-semibold text-white shadow-float transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Send {money(payment.amount)}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
