import { ArrowLeft } from 'lucide-react'
import { scoreText } from './copy'
import { Action, CreditsLink, Lessons, Panel } from './parts'
import { mutedText, type Skin } from './skin'
import { TrustedEnroll } from './TrustedEnroll'
import type { Score } from './voiceGame'

type Props = Skin & {
  score: Score
  /** The panel's phone page: no trusted contact, just a way back. */
  standalone: boolean
  onBack: () => void
}

/** The score with its caution, then the two habits that work whoever is on the line. */
export function DrillEnding({ sound, score, standalone, onBack }: Props) {
  const muted = mutedText({ sound })
  return (
    <>
      <Panel sound={sound}>
        <p className="text-[17px] leading-snug font-semibold" role="status">
          {scoreText(score)}
        </p>
        <p
          className={`mt-3 mb-2 text-[13px] font-semibold tracking-wide uppercase ${muted.className}`}
          style={muted.style}
        >
          When a call asks for money
        </p>
        <Lessons sound={sound} />
      </Panel>
      {standalone ? (
        <Action sound={sound} onClick={onBack}>
          <ArrowLeft size={18} aria-hidden /> Back
        </Action>
      ) : (
        <TrustedEnroll sound={sound} />
      )}
      <CreditsLink sound={sound} />
    </>
  )
}
