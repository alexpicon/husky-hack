import { MessageSquareText, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Source } from '../../ui/primitives'
import { Panel, StatusPill } from './parts'
import { HOLD_HOURS } from './trickedFacts'
import { heardNo, heardYes, yesReleases } from './takeoverStages'
import { priorContact, type TakeoverFacts } from './takeoverFacts'
import type { TakeoverStage } from './TakeoverCase'

/** What the member said, and how Sound heard it: one text reply, or a text YES and a specialist's callback. */
function heard(f: TakeoverFacts, stage: TakeoverStage, saidYesFirst: boolean, phone: string) {
  const no = heardNo(stage)
  if (no && saidYesFirst) {
    return {
      pill: 'Callback: NO',
      said: `${f.name} texted "Yes, this was me.", then told the specialist "No, this wasn't me."`,
      from: `The text and the callback both used the ${phone}.`,
    }
  }
  if (no) return { pill: 'Replied NO', said: `${f.name} said "No, this wasn't me."`, from: `Reply came from the ${phone}.` }
  const said = `${f.name} said "Yes, this was me."`
  if (yesReleases(f.fullStop)) return { pill: 'Replied YES', said, from: `Reply came from the ${phone}.` }
  return stage === 'released'
    ? { pill: 'Callback: confirmed', said, from: `Reply came from the ${phone}; a specialist's callback to it confirmed.` }
    : { pill: 'Replied YES', said, from: `Reply came from the ${phone}. A specialist calls it back before release.` }
}

export function ResponsePanel({
  f,
  stage,
  saidYesFirst = false,
}: {
  f: TakeoverFacts
  stage: TakeoverStage
  saidYesFirst?: boolean
}) {
  if (stage === 'watching') return null
  const phone = priorContact(f, 'phone', 'phone number')
  const no = heardNo(stage)
  const yes = heardYes(stage)
  const reply = heard(f, stage, saidYesFirst, phone.label)
  const waiting = stage === 'its-me' && !yesReleases(f.fullStop)
  const pill = no ? (
    <StatusPill tone="danger">{reply.pill}</StatusPill>
  ) : yes ? (
    <StatusPill tone={waiting ? 'warn' : 'safe'}>{reply.pill}</StatusPill>
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
          className={`mb-3 flex items-center gap-3 rounded-xl px-3.5 py-3 ${no ? 'bg-danger-soft text-danger' : waiting ? 'bg-warn-soft text-warn' : 'bg-safe-soft text-safe'}`}
        >
          {no ? <ThumbsDown size={20} className="shrink-0" /> : <ThumbsUp size={20} className="shrink-0" />}
          <div>
            <div className="text-[15px] font-semibold">{reply.said}</div>
            <div className="text-xs opacity-80">{reply.from}</div>
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
          No reply within {HOLD_HOURS} hours: it isn't sent, Sound texts and calls the number on file,
          and the member can send it again. They can also call the number on their card or visit a
          branch.
        </p>
      )}
    </Panel>
  )
}
