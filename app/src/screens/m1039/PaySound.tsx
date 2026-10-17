import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { clock, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { SOUND, SoundAppScreen, SoundButton, SoundCard, SoundRow } from '../../ui/soundApp'
import { facts, railLabel } from './facts'
import { MEMO } from './parts'
import { SoundChip, SoundHeading, SoundRecipient } from './soundParts'
import { muted } from './soundTokens'

export function PaySound() {
  const { next } = useStory()
  const { payment, recipientAdded } = facts
  return (
    <SoundAppScreen title="Bill Pay" tab="payments" back>
      <div className="flex flex-col gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <SoundCard className="text-center">
            <div className="text-[15px]" style={muted}>
              You're sending
            </div>
            <div
              className="num mt-1 text-[40px] leading-none font-bold tracking-tight"
              style={{ color: SOUND.navy }}
            >
              {money(payment.amount)}
            </div>
            <div className="mt-2">
              <Source ids={payment.id} />
            </div>
          </SoundCard>
        </motion.div>

        <SoundCard>
          <SoundHeading>To</SoundHeading>
          <div className="mt-3">
            <SoundRecipient
              addedAt={`today, ${clock(recipientAdded.at)}`}
              source={recipientAdded.id}
              badge={<SoundChip>New</SoundChip>}
            />
          </div>
          <div className="mt-2">
            <SoundRow label="Memo" value={MEMO} />
            <SoundRow label="Sent by" value={railLabel(payment.rail)} />
            <SoundRow label="Arrives" value="Today" />
            <SoundRow label="Payment" value={<span className="font-mono text-[14px]">{payment.paymentId}</span>} />
          </div>
        </SoundCard>

        <SoundButton onClick={next}>
          Send {money(payment.amount)}
          <ArrowRight size={18} />
        </SoundButton>
      </div>
    </SoundAppScreen>
  )
}
