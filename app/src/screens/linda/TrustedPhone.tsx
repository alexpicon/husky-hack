import { motion } from 'motion/react'
import { EyeOff, Phone as PhoneIcon } from 'lucide-react'
import { SoundMark } from '../../ui/brand'
import { clock, day } from '../../ui/format'
import { Phone } from '../../ui/devices'
import { lindaFacts, storyTimes } from './facts'

const lockClock = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/, '')

export function TrustedPhone() {
  const name = lindaFacts().key.persona
  const at = storyTimes().trusted

  return (
    <Phone time={clock(at)} caption={`${name}'s trusted person gets one message`} dark>
      <div className="flex min-h-full flex-col bg-[radial-gradient(120%_70%_at_20%_0%,#3730a3_0%,transparent_60%),radial-gradient(90%_60%_at_100%_100%,#115e59_0%,transparent_60%)] px-4 pt-5 pb-6">
        <div className="text-center text-white">
          <div className="text-[17px] font-medium text-white/80">{day(at)}</div>
          <div className="num text-[76px] leading-none font-extralight tracking-tight">
            {lockClock(at)}
          </div>
        </div>

        <motion.article
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.3 }}
          className="mt-7 rounded-3xl bg-white/95 p-4 text-ink shadow-2xl backdrop-blur"
          aria-label={`Message from Sound Credit Union: ${name} would like you to call her.`}
        >
          <div className="flex items-center gap-2.5">
            <SoundMark size={30} />
            <span className="text-[15px] font-semibold text-ink-2">Sound Credit Union</span>
            <span className="ml-auto text-sm text-ink-3">now</span>
          </div>
          <h2 className="mt-3 text-[19px] leading-snug font-semibold">
            {name} would like you to call her.
          </h2>
          <p className="mt-1 text-base leading-snug text-ink-2">
            She asked us to let you know. Please call her on the number you already have for her.
          </p>
          <button
            type="button"
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-base font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
          >
            <PhoneIcon size={18} aria-hidden /> Call {name}
          </button>
        </motion.article>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-3 flex gap-3 rounded-3xl bg-white/12 p-4 text-white ring-1 ring-white/15 backdrop-blur"
        >
          <EyeOff size={20} className="mt-0.5 shrink-0 text-teal-200" aria-hidden />
          <p className="text-base leading-snug text-white/90">
            You won't see any amounts, balances or account details. Sound only passes on her
            request.
          </p>
        </motion.div>

        <p className="mt-auto pt-4 text-center text-base leading-snug text-white/70">
          {name} chose you as her trusted person. You can stop these messages anytime.
        </p>
      </div>
    </Phone>
  )
}
