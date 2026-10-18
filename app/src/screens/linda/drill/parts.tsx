import type { ReactNode } from 'react'
import { Check, ExternalLink } from 'lucide-react'
import { Button } from '../../../ui/primitives'
import { SOUND, SoundButton } from '../../../ui/soundApp'
import { LESSONS } from './copy'
import { mutedText, type Skin } from './skin'
import { CREDITS_URL } from './voiceCheck'

/** A white card: shadowed on Sound's grey canvas, ringed on the concept's white. */
export function Panel({ sound, className = '', children }: Skin & { className?: string; children: ReactNode }) {
  const edge = sound ? 'shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'ring-1 ring-line'
  return <div className={`rounded-[20px] bg-white p-4 ${edge} ${className}`}>{children}</div>
}

type ActionProps = Skin & {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

/** A full-width button, 48 px tall in both looks. */
export function Action({ sound, variant = 'primary', onClick, disabled, children }: ActionProps) {
  if (sound) {
    return (
      <SoundButton variant={variant === 'primary' ? 'primary' : 'outline'} onClick={onClick} disabled={disabled}>
        {children}
      </SoundButton>
    )
  }
  return (
    <Button size="lg" variant={variant} onClick={onClick} disabled={disabled} className="w-full">
      {children}
    </Button>
  )
}

/** The two habits the drill ends on. */
export function Lessons({ sound }: Skin) {
  const accent = sound ? SOUND.link : 'var(--color-safe)'
  return (
    <ul className="flex flex-col gap-2" aria-label="What to do on a real call">
      {LESSONS.map((lesson) => (
        <li key={lesson} className="flex items-center gap-2.5 text-[16px] leading-snug font-semibold">
          <span className="grid size-6 shrink-0 place-items-center rounded-full text-white" style={{ background: accent }}>
            <Check size={14} strokeWidth={3} aria-hidden />
          </span>
          {lesson}
        </li>
      ))}
    </ul>
  )
}

/** Where the recordings and photos come from, as their licenses ask. */
export function CreditsLink({ sound }: Skin) {
  const muted = mutedText({ sound })
  return (
    <a
      href={CREDITS_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-11 items-center gap-1.5 self-center text-[13px] font-medium underline underline-offset-2 ${muted.className}`}
      style={muted.style}
    >
      Recordings and photos: credits <ExternalLink size={13} aria-hidden />
    </a>
  )
}
