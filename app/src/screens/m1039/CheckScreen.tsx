import type { ReactNode } from 'react'
import { Clock, KeyRound, MapPin, MessageSquareText, Phone, Smartphone, UserPlus } from 'lucide-react'
import { motion } from 'motion/react'
import { useStory } from '../../story/engine'
import { Source } from '../../ui/primitives'
import { money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { CheckSound } from './CheckSound'
import { facts, HOLD_HOURS, whenLabel } from './facts'

function Noticed({ icon, label, at, source }: { icon: ReactNode; label: string; at: Date; source: string }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-ink-2">
        {icon}
      </span>
      <span className="flex-1 text-[16px] text-ink">{label}</span>
      <span className="flex flex-col items-end leading-tight">
        <span className="num text-[13px] text-ink-3">{whenLabel(at)}</span>
        <Source ids={source} />
      </span>
    </li>
  )
}

export function CheckScreen() {
  return useLook() === 'sound' ? <CheckSound /> : <ConceptCheckScreen />
}

function ConceptCheckScreen() {
  const { next } = useStory()
  const { payment, reset, address, recipientAdded } = facts
  return (
    <div className="flex min-h-full flex-col bg-linear-to-b from-brand-soft via-white to-white px-5 pt-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[36px] leading-[1.05] tracking-tight text-ink">
          One quick check
        </h2>
        <motion.span
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-float ring-1 ring-indigo-100"
        >
          <MessageSquareText size={22} />
        </motion.span>
      </div>
      <p className="mt-2 text-[17px] leading-snug text-ink-2">
        A few things on your account are new, so we'd like a quick yes before{' '}
        <span className="num font-semibold text-ink">{money(payment.amount)}</span> goes.
      </p>

      <ul className="mt-3 divide-y divide-line/70">
        <Noticed icon={<KeyRound size={15} />} label="New password" at={reset.at} source={reset.id} />
        <Noticed icon={<MapPin size={15} />} label="New address" at={address.at} source={address.id} />
        <Noticed
          icon={<UserPlus size={15} />}
          label="New recipient"
          at={recipientAdded.at}
          source={recipientAdded.id}
        />
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-3 flex gap-3 rounded-2xl bg-safe-soft p-4 ring-1 ring-teal-100"
      >
        <Smartphone size={22} className="mt-0.5 shrink-0 text-safe" />
        <div className="min-w-0">
          <div className="text-[16px] font-semibold text-ink">We texted your phone</div>
          <p className="mt-0.5 text-[15px] leading-snug text-ink-2">
            The number you've had with us all along.{' '}
            <span className="font-semibold text-safe">It hasn't changed.</span>
          </p>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={next}
        className="mt-5 flex h-14 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-ink text-[17px] font-semibold text-white shadow-float transition hover:bg-slate-800 active:scale-[0.98]"
      >
        <MessageSquareText size={19} />
        Check your messages
      </button>

      <div className="mt-4 space-y-2 text-[16px] leading-snug text-ink-3">
        <p className="flex gap-2">
          <Clock size={16} className="mt-1 shrink-0" />
          Your payment is saved. It can wait up to {HOLD_HOURS} hours.
        </p>
        <p className="flex gap-2">
          <Phone size={16} className="mt-1 shrink-0" />
          No phone handy? Call the number on your card.
        </p>
      </div>
    </div>
  )
}
