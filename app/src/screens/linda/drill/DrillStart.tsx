import { useEffect, useRef } from 'react'
import { Headphones } from 'lucide-react'
import { SOUND } from '../../../ui/soundApp'
import type { DrillPair } from './clips'
import { DECLINED, DRILL_SUBTITLE, DRILL_TITLE, HOW_IT_WORKS, LOAD_FAILED, NO_ANALYSIS, OPT_IN } from './copy'
import { Action, CreditsLink, Lessons, Panel } from './parts'
import { mutedText, titleText, type Skin } from './skin'

type Props = Skin & {
  pairs: DrillPair[] | 'loading' | 'failed'
  /** She said "Not now" once; the drill can still be started. */
  declined: boolean
  onStart: () => void
  onNotNow: () => void
}

/** The opt-in: nothing plays until she chooses to try it. */
export function DrillStart({ sound, pairs, declined, onStart, onNotNow }: Props) {
  const title = titleText({ sound })
  const muted = mutedText({ sound })
  const failed = pairs === 'failed'
  // "Not now" goes away when she presses it, so focus moves to the line that answers it.
  const declinedLine = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (declined) declinedLine.current?.focus()
  }, [declined])
  return (
    <>
      <Panel sound={sound}>
        <div className="flex items-center gap-3">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full ${sound ? '' : 'bg-brand-soft text-brand'}`}
            style={sound ? { background: '#eaf2fc', color: SOUND.navy } : undefined}
          >
            <Headphones size={22} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className={`text-[21px] leading-tight font-bold ${title.className}`} style={title.style}>
              {DRILL_TITLE}
            </h2>
            <p className={`text-[15px] ${muted.className}`} style={muted.style}>
              {DRILL_SUBTITLE}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[17px] leading-snug font-semibold">{OPT_IN}</p>
        <p className="mt-1 text-[15px] leading-snug">{HOW_IT_WORKS}</p>
        <p className={`mt-2 text-[13px] leading-snug ${muted.className}`} style={muted.style}>
          {NO_ANALYSIS}
        </p>
      </Panel>

      {failed ? (
        <Panel sound={sound}>
          <p className="mb-2.5 text-[15px] leading-snug" role="status">
            {LOAD_FAILED}
          </p>
          <Lessons sound={sound} />
        </Panel>
      ) : (
        <>
          {declined && (
            <p ref={declinedLine} tabIndex={-1} className="text-[15px] leading-snug" role="status">
              {DECLINED}
            </p>
          )}
          <Action sound={sound} onClick={onStart} disabled={pairs === 'loading'}>
            {pairs === 'loading' ? 'Loading recordings' : 'Try the drill'}
          </Action>
        </>
      )}
      {!declined && (
        <Action sound={sound} variant="secondary" onClick={onNotNow}>
          Not now
        </Action>
      )}
      <CreditsLink sound={sound} />
    </>
  )
}
