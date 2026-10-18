import { useEffect, useRef, useState } from 'react'
import { BellRing, Check, Hand, UserRoundCheck, UserRoundPlus, UserRoundX, type LucideIcon } from 'lucide-react'
import { SOUND } from '../../../ui/soundApp'
import { TRUSTED_ADDED, TRUSTED_LATER } from './copy'
import { drillActions, updateDrill, useDrill } from './drillState'
import { Action, Panel } from './parts'
import { mutedText, titleText, type Skin } from './skin'

type Rule = { icon: LucideIcon; title: string; body: string }
type Step = 'offer' | 'rules' | 'later'

/** The trusted-person rules, said to her: the same terms the wire desk and her story use. */
const RULES: Rule[] = [
  { icon: Hand, title: 'Optional', body: 'You decide whether to have one at all.' },
  { icon: UserRoundCheck, title: 'Chosen by you', body: 'Set up ahead of time, in the app or at a branch.' },
  { icon: UserRoundX, title: 'Removable anytime', body: 'One tap in the app, or at a branch or by phone.' },
  { icon: BellRing, title: 'Informed only', body: 'A request to call you. Never amounts, never access.' },
]

/** On a calm day, the offer to add a trusted contact, which she can take or leave. */
export function TrustedEnroll({ sound }: Skin) {
  const { trustedAdded } = useDrill()
  const [step, setStep] = useState<Step>('offer')
  const view = trustedAdded ? 'added' : step
  const title = titleText({ sound })
  const muted = mutedText({ sound })
  const accent = sound ? SOUND.link : 'var(--color-brand)'

  // Each view replaces the button she pressed, so focus follows to what replaced it. Only her own
  // press here moves it: a contact added from another window leaves this window's focus alone.
  const pressed = useRef(false)
  const target = useRef<HTMLElement | null>(null)
  const aim = (el: HTMLElement | null) => {
    target.current = el
  }
  useEffect(() => {
    if (!pressed.current) return
    pressed.current = false
    const el = view === 'offer' ? target.current?.querySelector('button') : target.current
    el?.focus()
  }, [view])
  const press = (next: () => void) => () => {
    pressed.current = true
    next()
  }

  if (view === 'added') {
    return (
      <Panel sound={sound}>
        <p ref={aim} tabIndex={-1} className="flex items-center gap-2 text-[17px] font-semibold" role="status">
          <span className="grid size-6 place-items-center rounded-full text-white" style={{ background: accent }}>
            <Check size={14} strokeWidth={3} aria-hidden />
          </span>
          Trusted contact added
        </p>
        <p className="mt-1.5 text-[15px] leading-snug">{TRUSTED_ADDED}</p>
      </Panel>
    )
  }
  if (view === 'later') {
    return (
      <p ref={aim} tabIndex={-1} className="text-[15px] leading-snug" role="status">
        {TRUSTED_LATER}
      </p>
    )
  }
  if (view === 'rules') {
    return (
      <Panel sound={sound}>
        <h3 ref={aim} tabIndex={-1} className={`text-[18px] font-bold ${title.className}`} style={title.style}>
          Add a trusted contact
        </h3>
        <ul className="mt-2.5 flex flex-col gap-2.5">
          {RULES.map(({ icon: Icon, title: name, body }) => (
            <li key={name} className="flex gap-2.5">
              <Icon size={20} className="mt-0.5 shrink-0" style={{ color: accent }} aria-hidden />
              <span className="text-[14px] leading-snug">
                <span className="block font-semibold">{name}</span>
                <span className={muted.className} style={muted.style}>
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3.5 flex flex-col gap-2">
          <Action sound={sound} onClick={press(() => updateDrill(drillActions.addTrusted))}>
            <UserRoundPlus size={18} aria-hidden /> Choose from my contacts
          </Action>
          <Action sound={sound} variant="secondary" onClick={press(() => setStep('offer'))}>
            Cancel
          </Action>
        </div>
      </Panel>
    )
  }
  return (
    <div ref={aim} className="flex flex-col gap-2">
      <Action sound={sound} onClick={press(() => setStep('rules'))}>
        Add a trusted contact
      </Action>
      <Action sound={sound} variant="secondary" onClick={press(() => setStep('later'))}>
        Not now
      </Action>
    </div>
  )
}
