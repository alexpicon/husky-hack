import type { ReactNode } from 'react'
import { PauseCircle, type LucideIcon } from 'lucide-react'
import { SoundLogo } from '../../ui/brand'
import { Tablet } from '../../ui/devices'
import { SOUND, soundFont } from '../../ui/soundApp'
import { dollars, lindaFacts } from './facts'

/** Linda's branch tablet in the Sound look: navy bar, grey canvas, white cards, no tab bar. */
export function SoundKiosk({ caption, children }: { caption: string; children: ReactNode }) {
  const f = lindaFacts()
  return (
    <Tablet caption={caption}>
      <div
        className="flex min-h-full flex-col"
        style={{ ...soundFont, background: SOUND.canvas, color: SOUND.text }}
      >
        <header
          className="sticky top-0 z-10 flex h-[52px] shrink-0 items-center justify-between px-6 shadow-[0_2px_6px_rgb(0_0_0/0.18)]"
          style={{ background: `linear-gradient(180deg, ${SOUND.navy}, ${SOUND.navyLight})` }}
        >
          <SoundLogo height={18} inverted />
          <span className="flex items-center gap-2 text-[15px] font-medium text-white">
            <PauseCircle size={17} className="text-amber-300" aria-hidden />
            Your wire is paused · <span className="num font-semibold">{dollars(f.wire.amount)}</span>
          </span>
        </header>
        <div className="flex flex-1 flex-col gap-3 px-5 py-4">{children}</div>
      </div>
    </Tablet>
  )
}

/** A Sound line icon at the size the app uses on its cards. */
export function NavyIcon({ icon: Icon, size = 28 }: { icon: LucideIcon; size?: number }) {
  return <Icon size={size} strokeWidth={1.7} color={SOUND.navy} className="shrink-0" aria-hidden />
}
