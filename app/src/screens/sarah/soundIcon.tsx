import type { LucideIcon } from 'lucide-react'
import { SOUND } from '../../ui/soundApp'

/** The navy line icon that leads a Sound app card. */
export function CardIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      size={40}
      strokeWidth={1.5}
      className="shrink-0"
      style={{ color: SOUND.navy }}
      aria-hidden
    />
  )
}
