import { MessageSquareText, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Source } from '../../ui/primitives'
import { Panel, StatusPill } from './parts'
import { heardNo, heardYes } from './takeoverStages'
import { priorContact, type TakeoverFacts } from './takeoverFacts'
import type { TakeoverStage } from './TakeoverCase'

export function ResponsePanel({ f, stage }: { f: TakeoverFacts; stage: TakeoverStage }) {
  if (stage === 'watching') return null
  const phone = priorContact(f, 'phone', 'phone number')
  const no = heardNo(stage)
  const yes = heardYes(stage)
  const pill = no ? (
    <StatusPill tone="danger">Replied NO</StatusPill>
  ) : yes ? (
    <StatusPill tone="safe">Replied YES</StatusPill>
  ) : stage === 'asked' ? (
    <StatusPill tone="warn" live>
      Waiting
    </StatusPill>
  ) : (
    <StatusPill tone="brand">Sending</StatusPill>
  )
  return (
    <Panel title='"Was this you?"' icon={<MessageSquareText size={14} />} aside={pill} delay={0.1}>
      {(no || yes) && (
        <div
          className={`mb-3 flex items-center gap-3 rounded-xl px-3.5 py-3 ${no ? 'bg-danger-soft text-danger' : 'bg-safe-soft text-safe'}`}
        >
          {no ? <ThumbsDown size={20} /> : <ThumbsUp size={20} />}
          <div>
            <div className="text-[15px] font-semibold">
              {f.name} said {no ? '"No, this wasn\'t me."' : '"Yes, this was me."'}
            </div>
            <div className="text-xs opacity-80">
              Reply came from the {phone.label}.
            </div>
          </div>
        </div>
      )}
      <p className="text-sm leading-relaxed text-ink-2">
        {stage === 'paused' ? 'Sending to ' : 'Sent to '}
        <span className="font-semibold text-ink">the {phone.label}</span>
        {phone.ids.length > 0 && (
          <>
            {' '}
            <Source ids={phone.ids} />
          </>
        )}
        . Never to {f.changes.some((c) => c.kind !== 'address') ? 'the new email or phone' : 'a detail that just changed'}.
      </p>
      {stage === 'asked' && (
        <p className="mt-1.5 text-xs text-ink-3">
          No reply? The member can call the number on their card or visit a branch.
        </p>
      )}
    </Panel>
  )
}
