import { ReportBanner } from '../../report/ReportBanner'
import { StaffWindow } from '../../ui/devices'
import { day } from '../../ui/format'
import { ChangeTimeline } from './ChangeTimeline'
import { ContactsPanel } from './ContactsPanel'
import { MoneyPanel } from './MoneyPanel'
import { OutcomeBanner } from './OutcomeBanner'
import { useReportedCase } from '../../report/report'
import { CaseHeader, StatusPill } from './parts'
import { ResponsePanel } from './ResponsePanel'
import { SignalsPanel } from './SignalsPanel'
import { TakeoverActions } from './TakeoverActions'
import { takeoverFacts, tierName } from './takeoverFacts'
import { WhyPaused } from './WhyPaused'
import { whyTakeover } from './pauseReasons'
import { heardYes, isOpen, pillFor, wasAsked, yesReleases } from './takeoverStages'

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

export function TakeoverCase({
  member,
  stage,
  saidYesFirst = false,
  onCallbackDone,
}: {
  member: 'M1003' | 'M1039'
  stage: TakeoverStage
  /** The member texted YES before the specialist's callback heard NO. */
  saidYesFirst?: boolean
  onCallbackDone?: () => void
}) {
  const f = takeoverFacts(member)
  const yesOk = yesReleases(f.fullStop)
  const pill = pillFor(stage, yesOk)
  // A YES that still needs a callback confirms nothing yet.
  const confirmed = heardYes(stage) && (yesOk || stage === 'released')
  const open = isOpen(stage)
  const watching = stage === 'watching'
  const reportedCase = useReportedCase(member)
  const caseId = open ? f.caseId : reportedCase
  return (
    <StaffWindow title={caseId ? `Case ${caseId}` : 'Account monitor'}>
      <div className="@container space-y-5">
        <CaseHeader
          name={f.name}
          member={member}
          kind={`${open ? `Account takeover · ${tierName(f).toLowerCase()}` : 'Account takeover watch'} · ${day(f.hit.at)}`}
          caseId={caseId}
          pill={
            <StatusPill tone={pill.tone} live={pill.live}>
              {pill.label}
            </StatusPill>
          }
        />
        {open && <WhyPaused why={whyTakeover(f)} />}
        <ReportBanner member={member} />
        {(stage === 'secured' || (stage === 'released' && yesOk)) && <OutcomeBanner f={f} stage={stage} />}
        <TakeoverActions
          name={f.name}
          stage={stage}
          fullStop={f.fullStop}
          saidYesFirst={saidYesFirst}
          onCallbackDone={onCallbackDone}
        />
        <div className="grid items-start gap-4 @2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <SignalsPanel f={f} watching={watching} confirmed={confirmed} />
            <ChangeTimeline f={f} watching={watching} confirmed={confirmed} />
          </div>
          <div className="space-y-4">
            <MoneyPanel f={f} stage={stage} />
            <ResponsePanel f={f} stage={stage} saidYesFirst={saidYesFirst} />
            <ContactsPanel f={f} asked={wasAsked(stage)} />
          </div>
        </div>
      </div>
    </StaffWindow>
  )
}
