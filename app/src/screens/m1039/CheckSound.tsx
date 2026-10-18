import { Building2, MessageSquareText } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { money } from '../../ui/format'
import { SOUND, SoundAppScreen, SoundButton, SoundCard, SoundRow } from '../../ui/soundApp'
import { LOST_PHONE, lostPhone, noAnswerInApp } from './answers'
import { useM1039Answer } from './answerState'
import { facts } from './facts'
import { SoundChip } from './soundParts'
import { muted } from './soundTokens'

export function CheckSound({ phoneLost = false }: { phoneLost?: boolean }) {
  const { next } = useStory()
  const { answer, give } = useM1039Answer()
  const lost = phoneLost || answer === 'lost-phone'
  const { payment } = facts
  return (
    <SoundAppScreen title="Bill Pay" tab="payments" back>
      <div className="flex flex-col gap-2.5">
        <SoundCard>
          <div className="flex gap-3">
            <MessageSquareText size={40} strokeWidth={1.5} color={SOUND.navy} className="shrink-0" aria-hidden />
            <div className="min-w-0">
              <h3 className="text-[19px] leading-tight font-bold">One quick check</h3>
              <p className="mt-1 text-[15px] leading-snug" style={muted}>
                This payment needs a quick yes before{' '}
                <span className="num font-semibold" style={{ color: SOUND.text }}>
                  {money(payment.amount)}
                </span>{' '}
                goes. If you started it, check your messages from Sound.
              </p>
            </div>
          </div>
        </SoundCard>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SoundCard className="py-1.5">
            <SoundRow
              label="Payment"
              value={<span className="num text-[17px] font-semibold">{money(payment.amount)}</span>}
            />
            <SoundRow label="Status" value={<SoundChip>Waiting for your yes</SoundChip>} />
          </SoundCard>
        </motion.div>

        {lost ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status">
            <SoundCard className="flex gap-3">
              <Building2 size={40} strokeWidth={1.5} color={SOUND.navy} className="shrink-0" aria-hidden />
              <div className="min-w-0">
                <div className="text-[17px] leading-tight font-bold">{lostPhone.title}</div>
                <p className="mt-1 text-[15px] leading-snug" style={muted}>
                  {lostPhone.body}
                </p>
              </div>
            </SoundCard>
          </motion.div>
        ) : (
          <>
            <SoundButton onClick={next}>
              <MessageSquareText size={19} />
              Check your messages
            </SoundButton>
            {answer === null && (
              <SoundButton variant="outline" onClick={() => give('lost-phone')}>
                {LOST_PHONE}
              </SoundButton>
            )}
          </>
        )}

        <p className="pt-0.5 text-center text-[13px] leading-snug text-balance" style={muted}>
          {noAnswerInApp}
        </p>
      </div>
    </SoundAppScreen>
  )
}
