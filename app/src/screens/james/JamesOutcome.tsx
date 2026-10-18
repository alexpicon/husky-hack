import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Banknote, Check, CircleX, FolderOpen, Phone, type LucideIcon } from 'lucide-react'
import { ReportRow } from '../../report/ReportRow'
import { useLook } from '../../ui/look'
import { Source } from '../../ui/primitives'
import { SOUND, SoundCard } from '../../ui/soundApp'
import { dollars } from '../linda/facts'
import { NavyIcon } from '../linda/kiosk'
import { handedOver } from './answers'
import { useJamesAnswers } from './answersState'
import { AUTONOMY, CALL_AGENCY, HANDED_OVER } from './copy'
import { jamesFacts } from './facts'
import { JamesTablet } from './kiosk'
import { endingLines } from './outcome'

/** A one-line card in either look: Sound's white card with a navy icon, or the concept's tinted box. */
function Line({ sound, icon: Icon, children }: { sound: boolean; icon: LucideIcon; children: ReactNode }) {
  if (sound) {
    return (
      <SoundCard className="flex items-start gap-3 py-2.5">
        <NavyIcon icon={Icon} size={22} />
        <p className="text-[14px] leading-snug">{children}</p>
      </SoundCard>
    )
  }
  return (
    <p className="flex items-start gap-3 rounded-2xl bg-brand-soft px-4 py-2.5 text-[14px] leading-snug text-ink ring-1 ring-indigo-200 ring-inset">
      <Icon size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
      <span>{children}</span>
    </p>
  )
}

function Cancelled({ sound }: { sound: boolean }) {
  return (
    <ol className={sound ? 'rounded-[20px] bg-white px-4 py-2 shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'rounded-2xl bg-white px-4 py-2 ring-1 ring-line'}>
      {endingLines().map((l, i) => (
        <motion.li
          key={l.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-baseline gap-3 border-b border-line/60 py-1 last:border-0"
        >
          <Check size={15} strokeWidth={3} className="shrink-0 self-center text-safe" aria-hidden />
          <span className="num w-[64px] shrink-0 font-mono text-xs text-ink-3">{l.at}</span>
          <span className="min-w-0 flex-1 text-[15px] leading-snug">{l.you}.</span>
          <Source ids={l.id} />
        </motion.li>
      ))}
    </ol>
  )
}

/** Step three's tablet: how the withdrawal ended, as the teller chose at step two, and the report row every branch screen has. */
export function JamesOutcome() {
  const sound = useLook() === 'sound'
  const over = handedOver(useJamesAnswers().state)
  const amount = dollars(jamesFacts().cash.amount)
  return (
    <JamesTablet
      caption="Branch tablet - how his withdrawal ended"
      icon={over ? Banknote : CircleX}
      status={over ? 'Cash handed over' : 'Withdrawal cancelled'}
    >
      <h2
        className={sound ? 'text-[22px] leading-tight font-bold' : 'font-display text-[28px] leading-tight text-ink'}
        style={sound ? { color: SOUND.navy } : undefined}
      >
        {over ? `The ${amount} was handed over.` : 'Your cash stays with you.'}
      </h2>
      {over ? (
        <Line sound={sound} icon={FolderOpen}>
          {HANDED_OVER}
        </Line>
      ) : (
        <Cancelled sound={sound} />
      )}
      <Line sound={sound} icon={Phone}>
        <strong>{CALL_AGENCY}</strong> {AUTONOMY}
      </Line>
      <div className="mt-auto" aria-hidden />
      <ReportRow channel="branch" edge={sound ? '-mx-5 -mb-4 px-5' : '-mx-6 -mb-5 px-6'} />
    </JamesTablet>
  )
}
