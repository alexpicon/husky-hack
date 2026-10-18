import { motion } from 'motion/react'
import { Headset } from 'lucide-react'
import { clock, day } from '../../ui/format'
import { Card, Eyebrow, Source } from '../../ui/primitives'
import { JAMES_NAME, jamesFacts } from './facts'

/** Step one's member pane: the call James made the day before, as the kit records it. */
export function CallCard() {
  const { call } = jamesFacts()
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="w-[420px] p-6">
        <div className="flex items-center justify-between">
          <Eyebrow>{day(call.at)}</Eyebrow>
          <span className="num font-mono text-xs text-ink-3">{clock(call.at)}</span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Headset size={22} aria-hidden />
          </span>
          <h2 className="font-display text-[26px] leading-tight text-ink">
            {JAMES_NAME} calls Sound's {call.channel.toLowerCase()}
          </h2>
        </div>
        <figure className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-line ring-inset">
          <figcaption className="text-xs font-semibold text-ink-3">The contact center's own note</figcaption>
          <blockquote className="mt-1 text-[18px] leading-snug font-medium text-ink">"{call.note}"</blockquote>
          <p className="mt-2 text-xs text-ink-3">
            In production this would be a call reason code. <Source ids={call.id} />
          </p>
        </figure>
      </Card>
    </motion.div>
  )
}
