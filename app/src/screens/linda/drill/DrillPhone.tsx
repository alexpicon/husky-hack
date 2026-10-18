import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { SoundMark } from '../../../ui/brand'
import { Phone } from '../../../ui/devices'
import { clock } from '../../../ui/format'
import { useLook } from '../../../ui/look'
import { SoundAppScreen } from '../../../ui/soundApp'
import { DRILL_TITLE } from './copy'
import { drillDay } from './when'

/**
 * Linda's own phone, in the Sound app, weeks before her wire. Nothing is wrong that day, so the
 * screen carries no "I think I've been scammed" link.
 */
export function DrillPhone({ children }: { children: ReactNode }) {
  const sound = useLook() === 'sound'
  return (
    <Phone
      time={clock(drillDay())}
      caption="Sound app: a practice drill on an ordinary day"
      statusBar={sound ? 'navy' : undefined}
    >
      {sound ? (
        <SoundAppScreen title={DRILL_TITLE} tab="more" back report={false}>
          {children}
        </SoundAppScreen>
      ) : (
        <div className="flex min-h-full flex-col bg-white">
          <div className="flex items-center gap-2 px-4 pt-1 pb-3">
            <span className="grid size-9 place-items-center text-ink-2" aria-hidden>
              <ChevronLeft size={22} />
            </span>
            <span className="flex-1 text-center text-[16px] font-semibold text-ink">{DRILL_TITLE}</span>
            <span className="grid size-9 place-items-center">
              <SoundMark size={24} />
            </span>
          </div>
          <div className="px-4 pb-5">{children}</div>
        </div>
      )}
    </Phone>
  )
}
