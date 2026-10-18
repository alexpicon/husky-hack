import { useEffect, useRef, useState } from 'react'
import type { Look } from '../ui/look'
import { suggestTaps } from './client'
import { HEARD, NO, NO_MATCH, NOT_NOW, NOT_QUITE, TALK, THINKING, YES } from './copy'
import { showLatest } from './follow'
import { SKIPPER_LISTS, type SkipperScreen } from './lists'
import { Bubble, ChatHeader, Choice, Composer, OpenButton, PrivacyLine, SuggestedTap, useSkipperMode } from './SkipperParts'
import { MAX_TEXT, type Suggestion } from './verify'

/** What Skipper says once she confirms: fixed wording from the check's own rule, never the AI's. */
export type Outcome = { line: string; talk: boolean }

type Props = {
  screen: SkipperScreen
  look: Look
  /** The closed box's words, and the text box's label. */
  label: string
  greeting: string
  /** Turns the confirmed taps on in the existing check. */
  apply: (ids: string[]) => void
  outcome: Outcome | null
  /** "Talk to a person": the existing private-talk or case and callback flow. */
  onTalk?: () => void
  /** Her words, kept in this window until she shares. */
  onHeard?: (words: string) => void
  shares?: boolean
  startOpen?: boolean
}

type Phase = 'closed' | 'typing' | 'thinking' | 'heard' | 'no-match' | 'not-quite' | 'applied' | 'done'

/**
 * Skipper: she types what is going on, Skipper shows the taps her words fit, highlighted and not
 * selected, and only her "Yes" turns them on. The taps then go through the check's own rule.
 * Her text lives in this component and goes nowhere else unless `onHeard` keeps it for sharing.
 */
export function SkipperChat({ screen, look, label, greeting, apply, outcome, onTalk, onHeard, shares = true, startOpen = false }: Props) {
  const mode = useSkipperMode()
  const [phase, setPhase] = useState<Phase>(startOpen ? 'typing' : 'closed')
  const [draft, setDraft] = useState('')
  const [said, setSaid] = useState('')
  const [found, setFound] = useState<Suggestion[]>([])
  const asked = useRef(0)
  const end = useRef<HTMLParagraphElement>(null)
  const moved = useRef(false)
  const go = (next: Phase) => {
    moved.current = true
    setPhase(next)
  }
  // Only after a move, so a chat that mounts open never scrolls the page. The privacy line is last.
  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    if (phase !== 'done') showLatest(end.current)
  }, [phase])

  if (phase === 'closed') return <OpenButton look={look} label={label} onOpen={() => go('typing')} />

  const send = () => {
    const words = draft.trim()
    if (!words) return
    const ask = ++asked.current
    setSaid(words)
    setDraft('')
    setFound([])
    go('thinking')
    onHeard?.(words)
    void suggestTaps(screen, words, mode).then(({ taps }) => {
      if (ask !== asked.current) return
      setFound(taps)
      go(taps.length ? 'heard' : 'no-match')
    })
  }
  const confirm = () => {
    apply(found.map((s) => s.id))
    go('applied')
  }
  const labelOf = (id: string) => SKIPPER_LISTS[screen].find((t) => t.id === id)?.label ?? id
  const shown = found.length > 0 && ['heard', 'applied', 'done'].includes(phase)
  const typing = ['typing', 'no-match', 'not-quite'].includes(phase)
  const settled = phase === 'applied' || phase === 'done'

  return (
    <section
      aria-label="Skipper"
      className={`flex flex-col gap-2.5 rounded-2xl p-3 ${look === 'sound' ? 'bg-white shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'bg-white ring-1 ring-line'}`}
    >
      <ChatHeader look={look} />
      <div role="log" aria-live="polite" className="flex flex-col gap-2">
        <Bubble look={look} from="skipper">{greeting}</Bubble>
        {said && <Bubble look={look} from="member">{said}</Bubble>}
        {phase === 'thinking' && <Bubble look={look} from="skipper">{THINKING}</Bubble>}
        {shown && (
          <Bubble look={look} from="skipper">
            <p className="mb-1.5 font-semibold">{HEARD}</p>
            <ul className="flex flex-col gap-1.5" aria-label="Taps your words fit, not yet selected">
              {found.map((s) => (
                <SuggestedTap key={s.id} look={look} label={labelOf(s.id)} quote={s.quote} />
              ))}
            </ul>
          </Bubble>
        )}
        {phase === 'no-match' && <Bubble look={look} from="skipper">{NO_MATCH}</Bubble>}
        {phase === 'not-quite' && <Bubble look={look} from="skipper">{NOT_QUITE}</Bubble>}
        {settled && outcome && <Bubble look={look} from="skipper">{outcome.line}</Bubble>}
      </div>
      {phase === 'heard' && <Choice look={look} yes={YES} no={NO} onYes={confirm} onNo={() => go('not-quite')} />}
      {phase === 'applied' && outcome?.talk && onTalk && (
        <Choice
          look={look}
          yes={TALK}
          no={NOT_NOW}
          onYes={() => {
            onTalk()
            go('done')
          }}
          onNo={() => go('done')}
        />
      )}
      {typing && <Composer look={look} label={label} value={draft} max={MAX_TEXT} onChange={setDraft} onSend={send} />}
      <PrivacyLine ref={end} mode={mode} shares={shares} />
    </section>
  )
}
