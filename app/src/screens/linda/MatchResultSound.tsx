import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HeartHandshake, MessageCircle, Phone, PhoneCall } from 'lucide-react'
import { useStory } from '../../story/engine'
import { SOUND, SoundButton, SoundCard } from '../../ui/soundApp'
import { AUTONOMY, callBack, replies, shownTaps, verdict, type Reply } from './copy'
import { NavyIcon, SoundKiosk } from './kiosk'
import { useTaps } from './taps'

const SAFE = '#1f7a4d'

export function MatchResultSound() {
  const { next } = useStory()
  const [reply, setReply] = useState<Reply>(null)
  const { shown, named } = shownTaps(useTaps())
  const say = verdict(named)
  const call = callBack(named)

  return (
    <SoundKiosk caption="Branch tablet - Linda chose to share her taps with staff">
      <ul className="flex flex-wrap items-center gap-1.5" aria-label="What you tapped">
        <li className="mr-1 text-[14px] font-medium" style={{ color: SOUND.muted }}>
          You tapped
        </li>
        {shown.map((o) => (
          <li
            key={o.id}
            className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[14px] font-medium shadow-[0_1px_4px_rgb(15_23_42/0.08)]"
            style={{ color: SOUND.navy }}
          >
            <o.icon size={14} aria-hidden />
            {o.short}
          </li>
        ))}
      </ul>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-[24px] leading-tight font-bold" style={{ color: SOUND.navy }}>
          {say.headline}
        </h2>
        <p className="mt-1 text-[16px]" style={{ color: SOUND.muted }}>
          {say.subline}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <SoundCard className="flex items-start gap-3 py-3.5">
          <NavyIcon icon={Phone} />
          <p className="text-[17px] leading-snug">
            <strong>{call.lead}</strong> {call.rest}
          </p>
        </SoundCard>
      </motion.div>

      <div className="grid grid-cols-2 gap-2.5">
        <SoundButton onClick={() => setReply('calling')}>
          <PhoneCall size={18} aria-hidden /> Call from my own phone
        </SoundButton>
        <SoundButton variant="outline" onClick={next}>
          <HeartHandshake size={18} className="shrink-0" aria-hidden />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[15px] font-semibold">Ask my trusted person to call me</span>
            <span className="text-[12px] font-normal" style={{ color: SOUND.muted }}>
              Optional
            </span>
          </span>
        </SoundButton>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={reply ?? 'autonomy'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[16px] font-semibold"
            style={{ color: reply ? SAFE : SOUND.text }}
            aria-live="polite"
          >
            {reply ? replies[reply] : AUTONOMY}
          </motion.p>
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setReply('staff')}
          className="flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-[15px] font-medium transition hover:bg-white/70"
          style={{ color: SOUND.link }}
        >
          <MessageCircle size={16} aria-hidden />
          I still want to send - talk to staff
        </button>
      </div>
    </SoundKiosk>
  )
}
