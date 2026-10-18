import { StaffWindow } from '../../ui/devices'
import { day } from '../../ui/format'
import { ChangeTimeline } from './ChangeTimeline'
import { ContactsPanel } from './ContactsPanel'
import { MoneyPanel } from './MoneyPanel'
import { OutcomeBanner } from './OutcomeBanner'
import { CaseHeader, StatusPill } from './parts'
import { ResponsePanel } from './ResponsePanel'
import { SignalsPanel } from './SignalsPanel'
import { TakeoverActions } from './TakeoverActions'
import { takeoverFacts } from './takeoverFacts'
import { heardYes, isOpen, stagePill, wasAsked } from './takeoverStages'

/**
 * Stage of a takeover case as the story moves:
 * watching -> paused -> asked -> (not-me -> secured) | (its-me -> released)
 */
export type TakeoverStage =
  | 'watching'
  | 'paused'
  | 'asked'
  | 'not-me'
  | 'secured'
  | 'its-me'
  | 'released'

export function TakeoverCase({ member, stage }: { member: 'M1003' | 'M1039'; stage: TakeoverStage }) {
  const f = takeoverFacts(member)
  const pill = stagePill[stage]
  const open = isOpen(stage)
  const watching = stage === 'watching'
  return (
    <StaffWindow title={open ? `Case ${f.caseId}` : 'Account monitor'}>
      <div className="@container space-y-5">
        <CaseHeader
          name={f.name}
          member={member}
          kind={`Account takeover check · ${day(f.hit.at)}`}
          caseId={open ? f.caseId : undefined}
          pill={
            <StatusPill tone={pill.tone} live={pill.live}>
              {pill.label}
            </StatusPill>
          }
        />
        {(stage === 'secured' || stage === 'released') && <OutcomeBanner f={f} stage={stage} />}
        <TakeoverActions name={f.name} stage={stage} fullStop={f.fullStop} />
        <div className="grid items-start gap-4 @2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <SignalsPanel f={f} watching={watching} confirmed={heardYes(stage)} />
            <ChangeTimeline f={f} watching={watching} confirmed={heardYes(stage)} />
          </div>
          <div className="space-y-4">
            <MoneyPanel f={f} stage={stage} />
            <ResponsePanel f={f} stage={stage} />
            <ContactsPanel f={f} asked={wasAsked(stage)} />
          </div>
        </div>
      </div>
    </StaffWindow>
  )
}
