import type { ReactNode } from 'react'
import { SoundLogo } from '../../ui/brand'
import { motion } from 'motion/react'
import { Info, Sparkles } from 'lucide-react'
import { Badge } from '../../ui/primitives'

/** Wraps each of Linda's member screens with the preview badge and an optional design note. */
export function Stage({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Badge tone="warn">
        <Sparkles size={12} aria-hidden />
        Preview - working Sunday
      </Badge>
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

/** Sound's wordmark as it appears on member screens. */
export function SoundMark({ dark = false }: { dark?: boolean }) {
  return <SoundLogo height={16} inverted={dark} />
}

/** Small header strip for the branch tablet. */
export function TabletHeader({ right }: { right: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <SoundMark />
      <span className="flex items-center gap-2 text-sm font-medium text-ink-2">{right}</span>
    </div>
  )
}
