import { useState } from 'react'
import { BellRing, Check, Hand, UserRoundCheck, UserRoundPlus, UserRoundX, type LucideIcon } from 'lucide-react'
import { SOUND } from '../../../ui/soundApp'
import { TRUSTED_ADDED, TRUSTED_LATER } from './copy'
import { drillActions, updateDrill, useDrill } from './drillState'
import { Action, Panel } from './parts'
import { mutedText, titleText, type Skin } from './skin'

type Rule = { icon: LucideIcon; title: string; body: string }

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
  const [step, setStep] = useState<'offer' | 'rules' | 'later'>('offer')
  const title = titleText({ sound })
  const muted = mutedText({ sound })
  const accent = sound ? SOUND.link : 'var(--color-brand)'

  if (trustedAdded) {
    return (
      <Panel sound={sound}>
        <p className="flex items-center gap-2 text-[17px] font-semibold" role="status">
          <span className="grid size-6 place-items-center rounded-full text-white" style={{ background: accent }}>
            <Check size={14} strokeWidth={3} aria-hidden />
          </span>
          Trusted contact added
        </p>
        <p className="mt-1.5 text-[15px] leading-snug">{TRUSTED_ADDED}</p>
      </Panel>
    )
  }
  if (step === 'later') {
    return (
      <p className="text-[15px] leading-snug" role="status">
        {TRUSTED_LATER}
      </p>
    )
  }
  if (step === 'rules') {
    return (
      <Panel sound={sound}>
        <h3 className={`text-[18px] font-bold ${title.className}`} style={title.style}>
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
          <Action sound={sound} onClick={() => updateDrill(drillActions.addTrusted)}>
            <UserRoundPlus size={18} aria-hidden /> Choose from my contacts
          </Action>
          <Action sound={sound} variant="secondary" onClick={() => setStep('offer')}>
            Cancel
          </Action>
        </div>
      </Panel>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <Action sound={sound} onClick={() => setStep('rules')}>
        Add a trusted contact
      </Action>
      <Action sound={sound} variant="secondary" onClick={() => setStep('later')}>
        Not now
      </Action>
    </div>
  )
}
