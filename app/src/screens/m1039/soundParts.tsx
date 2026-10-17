import type { ReactNode } from 'react'
import { House } from 'lucide-react'
import { Source } from '../../ui/primitives'
import { SOUND } from '../../ui/soundApp'
import { RECIPIENT_LABEL } from './parts'
import { muted, SOUND_OK } from './soundTokens'

export function SoundChip({ tone = 'blue', children }: { tone?: 'blue' | 'green'; children: ReactNode }) {
  const style =
    tone === 'green' ? { background: '#e2f3e9', color: SOUND_OK } : { background: '#e6eefb', color: SOUND.link }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold" style={style}>
      {children}
    </span>
  )
}

export function SoundHeading({ children }: { children: ReactNode }) {
  return (
    <div className="text-[12px] font-bold tracking-wide uppercase" style={muted}>
      {children}
    </div>
  )
}

export function SoundRecipient({ addedAt, source, badge }: { addedAt: string; source: string; badge?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <House size={40} strokeWidth={1.5} color={SOUND.navy} className="shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-[17px] leading-tight font-bold">{RECIPIENT_LABEL}</div>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[15px]" style={muted}>
          <span>Added {addedAt}</span>
          <Source ids={source} />
        </div>
      </div>
      {badge}
    </div>
  )
}
