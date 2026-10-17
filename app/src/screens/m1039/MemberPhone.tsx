import type { ReactNode } from 'react'
import { Phone } from '../../ui/devices'
import { useLook } from '../../ui/look'

type Props = {
  time: string
  caption?: string
  /** False for screens outside the Sound app, like a Messages thread. */
  app?: boolean
  children: ReactNode
}

/** M1039's phone. In the Sound look, Sound app screens get the navy status bar. */
export function MemberPhone({ time, caption, app = true, children }: Props) {
  const look = useLook()
  return (
    <Phone time={time} caption={caption} statusBar={app && look === 'sound' ? 'navy' : undefined}>
      {children}
    </Phone>
  )
}
