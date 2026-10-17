import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { clock, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { SOUND, SoundAppScreen, SoundCard, SoundRow } from '../../ui/soundApp'
import { facts, railLabel } from './facts'
import { MEMO } from './parts'
import { muted, SOUND_OK, SoundChip, SoundRecipient } from './soundParts'

export function ReleasedSound() {
  const { payment, recipientAdded } = facts
  return (
    <SoundAppScreen title="Payments" tab="payments">
      <div className="flex flex-col gap-3">
        <SoundCard className="flex items-center gap-3.5">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="grid size-12 shrink-0 place-items-center rounded-full text-white"
            style={{ background: SOUND_OK }}
          >
            <Check size={26} strokeWidth={3} />
          </motion.span>
          <div className="min-w-0">
            <h3 className="text-[19px] leading-tight font-bold">Your payment is on its way</h3>
            <p className="mt-1 text-[15px] leading-snug" style={muted}>
              Thanks for confirming. That's all we needed.
            </p>
          </div>
        </SoundCard>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SoundCard>
            <div className="flex items-center justify-between gap-3">
              <span
                className="num text-[30px] leading-none font-bold tracking-tight"
                style={{ color: SOUND.navy }}
              >
                {money(payment.amount)}
              </span>
              <SoundChip tone="green">Same day</SoundChip>
            </div>
            <div className="mt-4">
              <SoundRecipient addedAt={`today, ${clock(recipientAdded.at)}`} source={recipientAdded.id} />
            </div>
            <div className="mt-2">
              <SoundRow label="Memo" value={MEMO} />
              <SoundRow label="Sent by" value={railLabel(payment.rail)} />
              <SoundRow label="Arrives" value="Today" />
              <SoundRow
                label="Payment"
                value={
                  <span className="flex flex-col items-end leading-tight">
                    <span className="font-mono text-[14px]">{payment.paymentId}</span>
                    <Source ids={payment.id} />
                  </span>
                }
              />
            </div>
          </SoundCard>
        </motion.div>

        <p className="pt-1 text-center text-[15px]" style={muted}>
          You're all set. Nothing else to do.
        </p>
      </div>
    </SoundAppScreen>
  )
}
