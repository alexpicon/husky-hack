import { motion } from 'motion/react'
import { CircleX, Clock, LifeBuoy, MessageCircle } from 'lucide-react'
import { SOUND, SoundButton, SoundCard } from '../../ui/soundApp'
import { AUTONOMY, callBack, checkBackBy, HOLD_PROMISE, readTaps, replies } from './copy'
import { NavyIcon, SoundKiosk } from './kiosk'
import { caseActions, useLindaCase } from './lindaCase'
import { ENDING_ICON, outcomeCopy, SEQUEL } from './outcomes'

const REPLY_GREEN = '#1f7a4d'

/** Linda's last screen in the Sound look: her three choices, then how it ended. */
export function DecideSound({ at }: { at: Date }) {
  const { state, update } = useLindaCase()
  const ending = state.outcome && outcomeCopy(state.outcome)
  const call = callBack(readTaps(state.taps))

  if (state.outcome && ending) {
    const Icon = ENDING_ICON[state.outcome.kind]
    return (
      <SoundKiosk
        caption="Branch tablet - how her wire ended"
        status={
          <>
            <Icon size={17} className="text-sky-200" aria-hidden />
            {ending.status}
          </>
        }
      >
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <SoundCard className="flex items-start gap-4 py-5">
            <NavyIcon icon={Icon} size={36} />
            <div>
              <h2 className="text-[24px] leading-tight font-bold" style={{ color: SOUND.navy }}>
                {ending.title}
              </h2>
              <p className="mt-1.5 text-[17px] leading-snug">{ending.body}</p>
            </div>
          </SoundCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SoundCard className="flex items-start gap-3 py-3.5">
            <NavyIcon icon={MessageCircle} />
            <p className="text-[17px] leading-snug font-semibold">{SEQUEL}</p>
          </SoundCard>
        </motion.div>
      </SoundKiosk>
    )
  }

  return (
    <SoundKiosk caption="Branch tablet - Linda decides">
      <div>
        <h2 className="text-[24px] leading-tight font-bold" style={{ color: SOUND.navy }}>
          What would you like to do?
        </h2>
        <p className="mt-1 text-[16px]" style={{ color: SOUND.muted }}>
          <strong style={{ color: SOUND.text }}>{call.lead}</strong> {call.rest}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <SoundButton onClick={() => update((c) => caseActions.decide(c, 'cancelled', at))}>
          <CircleX size={18} aria-hidden /> Cancel this wire
        </SoundButton>
        <SoundButton
          variant="outline"
          onClick={() => update((c) => caseActions.decide(c, 'help', at))}
        >
          <LifeBuoy size={18} aria-hidden /> Help me check this
        </SoundButton>
      </div>
      <SoundCard className="flex items-start gap-3 py-3">
        <NavyIcon icon={Clock} size={24} />
        <p className="text-[16px] leading-snug">
          <strong>{checkBackBy()}.</strong> {HOLD_PROMISE}
        </p>
      </SoundCard>
      <div className="mt-auto flex items-center justify-between gap-3">
        <p
          className="text-[16px] font-semibold"
          style={{ color: state.wantsToSend ? REPLY_GREEN : SOUND.text }}
          aria-live="polite"
        >
          {state.wantsToSend ? replies.staff : AUTONOMY}
        </p>
        {!state.wantsToSend && (
          <button
            type="button"
            onClick={() => update(caseActions.askToSend)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-[15px] font-medium transition hover:bg-white/70"
            style={{ color: SOUND.link }}
          >
            <MessageCircle size={16} aria-hidden />
            I still want to send - talk to staff
          </button>
        )}
      </div>
    </SoundKiosk>
  )
}
