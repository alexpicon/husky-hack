import type { ReactNode } from 'react'
import { SoundLogo } from '../../ui/brand'
import { motion } from 'motion/react'
import { Info, Lightbulb, PauseCircle } from 'lucide-react'
import { checkBackBy } from './copy'
import { dollars, lindaFacts } from './facts'

/**
 * Wraps each of Linda's member screens, with an optional label that says what is
 * illustrative and an optional design note.
 */
export function Stage({
  children,
  label,
  note,
}: {
  children: ReactNode
  label?: ReactNode
  note?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      {label && (
        <p className="flex max-w-[600px] items-start gap-2 rounded-2xl bg-warn-soft px-4 py-2.5 text-[13px] leading-snug font-medium text-ink ring-1 ring-amber-200 ring-inset">
          <Lightbulb size={15} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <span>{label}</span>
        </p>
      )}
      {children}
      {note && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex max-w-[560px] items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-ink-2 ring-1 ring-line"
        >
          <Info size={14} className="shrink-0 text-brand" aria-hidden />
          {note}
        </motion.p>
      )}
    </div>
  )
}

export function TabletHeader({ right }: { right: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <SoundLogo height={16} />
      <span className="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-ink-2">
        {right}
      </span>
    </div>
  )
}

/** The concept tablet's status while the wire is paused, with the time of the next update. */
export function PausedStatus() {
  const f = lindaFacts()
  return (
    <>
      <PauseCircle size={16} className="text-warn" aria-hidden />
      Your wire is paused · <span className="num font-mono">{dollars(f.wire.amount)}</span>
      <span className="ml-1 rounded-full bg-warn-soft px-2.5 py-0.5 text-xs font-semibold text-warn">
        {checkBackBy()}
      </span>
    </>
  )
}
