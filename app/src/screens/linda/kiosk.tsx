import type { ReactNode } from 'react'
import { PauseCircle, type LucideIcon } from 'lucide-react'
import { SoundLogo } from '../../ui/brand'
import { Tablet } from '../../ui/devices'
import { SOUND, soundFont } from '../../ui/soundApp'
import { checkBackBy } from './copy'
import { dollars, lindaFacts } from './facts'

/**
 * Linda's branch tablet in the Sound look: navy bar, grey canvas, white cards, no tab bar.
 * The bar says the wire is paused unless `status` says how it ended.
 */
export function SoundKiosk({
  caption,
  status,
  children,
}: {
  caption: string
  status?: ReactNode
  children: ReactNode
}) {
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
          <SoundLogo height={16} inverted />
          <span className="flex items-center gap-1.5 text-[14px] font-medium whitespace-nowrap text-white">
            {status ?? (
              <>
                <PauseCircle size={17} className="text-amber-300" aria-hidden />
                <span>Your wire is paused</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="num font-semibold">{dollars(f.wire.amount)}</span>
            {!status && (
              <span className="ml-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[12px]">
                {checkBackBy()}
              </span>
            )}
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
