import { motion } from 'motion/react'
import { Check, CircleX, Phone } from 'lucide-react'
import { ReportRow } from '../../report/ReportRow'
import { useLook } from '../../ui/look'
import { Source } from '../../ui/primitives'
import { SOUND, SoundCard } from '../../ui/soundApp'
import { NavyIcon } from '../linda/kiosk'
import { AUTONOMY, CALL_AGENCY } from './copy'
import { JamesTablet } from './kiosk'
import { endingLines } from './outcome'

/** Step three's tablet: how the withdrawal ended, and the report row every branch screen has. */
export function JamesOutcome() {
  const sound = useLook() === 'sound'
  const lines = endingLines()
  return (
    <JamesTablet caption="Branch tablet - how his withdrawal ended" icon={CircleX} status="Withdrawal cancelled">
      <h2
        className={sound ? 'text-[22px] leading-tight font-bold' : 'font-display text-[28px] leading-tight text-ink'}
        style={sound ? { color: SOUND.navy } : undefined}
      >
        Your cash stays with you.
      </h2>
      <ol className={sound ? 'rounded-[20px] bg-white px-4 py-2 shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'rounded-2xl bg-white px-4 py-2 ring-1 ring-line'}>
        {lines.map((l, i) => (
          <motion.li
            key={l.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-baseline gap-3 border-b border-line/60 py-1.5 last:border-0"
          >
            <Check size={15} strokeWidth={3} className="shrink-0 self-center text-safe" aria-hidden />
            <span className="num w-[64px] shrink-0 font-mono text-xs text-ink-3">{l.at}</span>
            <span className="min-w-0 flex-1 text-[15px] leading-snug">{l.you}.</span>
            <Source ids={l.id} />
          </motion.li>
        ))}
      </ol>
      {sound ? (
        <SoundCard className="flex items-start gap-3 py-2.5">
          <NavyIcon icon={Phone} size={22} />
          <p className="text-[15px] leading-snug">
            <strong>{CALL_AGENCY}</strong> {AUTONOMY}
          </p>
        </SoundCard>
      ) : (
        <p className="flex items-start gap-3 rounded-2xl bg-brand-soft px-4 py-2.5 text-[15px] leading-snug text-ink ring-1 ring-indigo-200 ring-inset">
          <Phone size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          <span>
            <strong>{CALL_AGENCY}</strong> {AUTONOMY}
          </span>
        </p>
      )}
      <div className="mt-auto" aria-hidden />
      <ReportRow channel="branch" edge={sound ? '-mx-5 -mb-4 px-5' : '-mx-6 -mb-5 px-6'} />
    </JamesTablet>
  )
}
