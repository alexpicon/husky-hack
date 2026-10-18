import { Info } from 'lucide-react'
import { Source } from '../../ui/primitives'
import type { Why } from './pauseReasons'

/** The rule that fired and its kit facts, in one sentence staff can read aloud. */
export function WhyPaused({ why }: { why: Why }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-line">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">
        <Info size={13} aria-hidden /> {why.label}
      </div>
      <p className="mt-1 text-[15px] leading-snug font-medium text-ink">
        {why.line} <Source ids={why.ids} />
      </p>
    </div>
  )
}
