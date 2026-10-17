import { motion } from 'motion/react'
import { Source, toneDot, type Tone } from './primitives'

export type TimelineItem = {
  time: string
  label: string
  detail?: string
  tone?: Tone
  source?: string
}

export function Timeline({ items, compact = false }: { items: TimelineItem[]; compact?: boolean }) {
  return (
    <ol className="relative">
      {items.map((item, i) => (
        <motion.li
          key={`${item.time}-${item.label}`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`relative flex gap-3 ${compact ? 'pb-3' : 'pb-4'} last:pb-0`}
        >
          {i < items.length - 1 && (
            <span className="absolute top-3 left-[5px] h-full w-px bg-line" aria-hidden />
          )}
          <span
            className={`relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-white ${toneDot[item.tone ?? 'neutral']}`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="num w-[68px] shrink-0 font-mono text-xs text-ink-3">{item.time}</span>
              <span className={`font-semibold text-ink ${compact ? 'text-sm' : 'text-[15px]'}`}>
                {item.label}
              </span>
            </div>
            {(item.detail || item.source) && (
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 pl-[76px] text-xs text-ink-3">
                {item.detail && <span>{item.detail}</span>}
                {item.source && <Source ids={item.source} />}
              </div>
            )}
          </div>
        </motion.li>
      ))}
    </ol>
  )
}
