import type { ReactNode } from 'react'
import { KeyRound, MapPin, MessageSquareText, Smartphone, UserPlus } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { SOUND, SoundAppScreen, SoundButton, SoundCard } from '../../ui/soundApp'
import { facts, HOLD_HOURS, whenLabel } from './facts'
import { muted, SOUND_OK } from './soundTokens'

const ICON = { size: 18, color: SOUND.navy, className: 'shrink-0', 'aria-hidden': true } as const

function Changed({ icon, label, at, source }: { icon: ReactNode; label: string; at: Date; source: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-black/[0.07] py-2 whitespace-nowrap last:border-0">
      <span className="flex items-center gap-2 text-[15px]" style={muted}>
        {icon}
        {label}
      </span>
      <span className="flex flex-col items-end leading-tight">
        <span className="num text-[14px] font-medium">{whenLabel(at)}</span>
        <Source ids={source} />
      </span>
    </div>
  )
}

export function CheckSound() {
  const { next } = useStory()
  const { payment, reset, address, recipientAdded } = facts
  return (
    <SoundAppScreen title="Bill Pay" tab="payments" back>
      <div className="flex flex-col gap-2.5">
        <SoundCard>
          <div className="flex gap-3">
            <MessageSquareText size={40} strokeWidth={1.5} color={SOUND.navy} className="shrink-0" aria-hidden />
            <div className="min-w-0">
              <h3 className="text-[19px] leading-tight font-bold">One quick check</h3>
              <p className="mt-1 text-[15px] leading-snug" style={muted}>
                A few things on your account are new, so we'd like a quick yes before{' '}
                <span className="num font-semibold" style={{ color: SOUND.text }}>
                  {money(payment.amount)}
                </span>{' '}
                goes.
              </p>
            </div>
          </div>
          <div className="mt-1">
            <Changed icon={<KeyRound {...ICON} />} label="New password" at={reset.at} source={reset.id} />
            <Changed icon={<MapPin {...ICON} />} label="New address" at={address.at} source={address.id} />
            <Changed
              icon={<UserPlus {...ICON} />}
              label="New recipient"
              at={recipientAdded.at}
              source={recipientAdded.id}
            />
          </div>
        </SoundCard>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SoundCard className="flex gap-3">
            <Smartphone size={40} strokeWidth={1.5} color={SOUND.navy} className="shrink-0" aria-hidden />
            <div className="min-w-0">
              <div className="text-[17px] leading-tight font-bold">We texted your phone</div>
              <p className="mt-1 text-[15px] leading-snug" style={muted}>
                The number you've had with us all along.{' '}
                <span className="font-semibold" style={{ color: SOUND_OK }}>
                  It hasn't changed.
                </span>
              </p>
            </div>
          </SoundCard>
        </motion.div>

        <SoundButton onClick={next}>
          <MessageSquareText size={19} />
          Check your messages
        </SoundButton>

        <div className="space-y-1 pt-0.5 text-center text-[13px] leading-snug text-balance" style={muted}>
          <p>Your payment is saved. It can wait up to {HOLD_HOURS} hours.</p>
          <p>No phone handy? Call the number on your card.</p>
        </div>
      </div>
    </SoundAppScreen>
  )
}
