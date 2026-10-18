import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { SoundLogo } from '../../ui/brand'
import { Tablet } from '../../ui/devices'
import { useLook } from '../../ui/look'
import { SOUND, soundFont } from '../../ui/soundApp'
import { dollars } from '../linda/facts'
import { TabletHeader } from '../linda/parts'
import { jamesFacts } from './facts'

type Props = { caption: string; icon: LucideIcon; status: string; children: ReactNode }

/** James's branch tablet in either look. The bar names the withdrawal and how it stands. */
export function JamesTablet({ caption, icon: Icon, status, children }: Props) {
  const amount = dollars(jamesFacts().cash.amount)
  if (useLook() === 'sound') {
    return (
      <Tablet caption={caption}>
        <div className="flex min-h-full flex-col" style={{ ...soundFont, background: SOUND.canvas, color: SOUND.text }}>
          <header
            className="sticky top-0 z-10 flex h-[52px] shrink-0 items-center justify-between px-6 shadow-[0_2px_6px_rgb(0_0_0/0.18)]"
            style={{ background: `linear-gradient(180deg, ${SOUND.navy}, ${SOUND.navyLight})` }}
          >
            <SoundLogo height={16} inverted />
            <span className="flex items-center gap-1.5 text-[14px] font-medium whitespace-nowrap text-white">
              <Icon size={17} className="text-sky-200" aria-hidden />
              {status} <span aria-hidden>·</span> <span className="num font-semibold">{amount}</span>
            </span>
          </header>
          <div className="flex flex-1 flex-col gap-2.5 px-5 py-4">{children}</div>
        </div>
      </Tablet>
    )
  }
  return (
    <Tablet caption={caption}>
      <div className="flex min-h-full flex-col gap-2.5 px-6 py-5">
        <TabletHeader
          right={
            <>
              <Icon size={16} className="text-brand" aria-hidden />
              {status} · <span className="num font-mono">{amount}</span>
            </>
          }
        />
        {children}
      </div>
    </Tablet>
  )
}
