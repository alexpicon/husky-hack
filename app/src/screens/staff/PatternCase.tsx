import { Quote } from 'lucide-react'
import { motion } from 'motion/react'
import { useReportedCase } from '../../report/report'
import { ReportBanner } from '../../report/ReportBanner'
import { StaffWindow } from '../../ui/devices'
import { day } from '../../ui/format'
import { Source } from '../../ui/primitives'
import type { WireChoice } from '../michael/check'
import { useMichaelCheck } from '../michael/checkState'
import { MichaelCheckSync } from '../michael/checkStore'
import { honestLine, MICHAEL, MICHAEL_NAME, michaelFacts, patternFact, wireFact } from '../michael/facts'
import { shortDate } from './helpers'
import { CaseHeader, StatusPill } from './parts'
import { PatternAnswersPanel, PatternPaymentsPanel, RomanceScriptPanel, WireHoldPanel } from './PatternPanels'
import { OneCasePanel } from './PatternTimeline'
import { WhyPaused } from './WhyPaused'
import { whyPattern } from './pauseReasons'

/** pattern: the card on his 4th growing P2P. wire: his first wire, held. report: the case, open until he reports. */
export type PatternStage = 'pattern' | 'wire' | 'report'

function Pill({ stage, reported, wire }: { stage: PatternStage; reported: boolean; wire: WireChoice | null }) {
  if (reported) return <StatusPill tone="danger">Scam reported</StatusPill>
  if (stage === 'wire' && wire === 'cancel') return <StatusPill tone="safe">{MICHAEL_NAME} cancelled the wire</StatusPill>
  if (stage === 'wire') {
    return (
      <StatusPill tone="warn" live>
        On hold · call {MICHAEL_NAME}
      </StatusPill>
    )
  }
  if (stage === 'pattern') return <StatusPill tone="brand">Pattern card shown</StatusPill>
  return <StatusPill tone="warn">Case open · every wire gets a call</StatusPill>
}

/** `now` is the story clock: the case never shows a kit event from after it. */
export function PatternCase({ stage, now }: { stage: PatternStage; now: Date }) {
  const f = michaelFacts()
  const reportedCase = useReportedCase(MICHAEL)
  const { wire, card } = useMichaelCheck().state
  const hit = stage === 'pattern' ? f.card : f.wire
  const kind = stage === 'report' ? `Relationship investment pattern · ${day(now)}` : `${stage === 'wire' ? 'Wire hold' : 'Pattern card'} · ${day(hit.at)}`
  return (
    <StaffWindow title={`Member Protection · ${reportedCase ?? (stage === 'report' ? `One case: ${MICHAEL_NAME} (${MICHAEL})` : `${stage === 'wire' ? 'Hold' : 'Card'} on ${hit.paymentId}`)}`}>
      <MichaelCheckSync />
      <div className="@container space-y-5">
        <CaseHeader
          name={MICHAEL_NAME}
          member={MICHAEL}
          kind={kind}
          caseId={reportedCase ?? (stage === 'report' ? `Open since ${shortDate(f.card.at)}` : undefined)}
          pill={<Pill stage={stage} reported={reportedCase !== undefined} wire={wire} />}
        />
        <WhyPaused why={whyPattern(f, stage, now)} />
        <ReportBanner member={MICHAEL} />
        {stage === 'report' ? (
          <p className="rounded-2xl bg-slate-50 px-5 py-4 font-display text-[22px] leading-tight tracking-tight text-ink ring-1 ring-line">
            {honestLine(f)}
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-white p-5 ring-1 ring-indigo-100"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-brand uppercase">
              <Quote size={13} />
              Sound's fact, the first line {MICHAEL_NAME} sees
            </div>
            <p className="mt-1.5 font-display text-[26px] leading-tight tracking-tight text-ink">
              {stage === 'wire' ? wireFact(f, card !== 'not-now') : patternFact(f)}
            </p>
            <div className="mt-1.5">
              <Source ids={stage === 'wire' ? [f.wire.id, f.wirePayeeAdded.id] : f.run.map((e) => e.id)} />
            </div>
          </motion.div>
        )}
        <div className="grid items-start gap-4 @2xl:grid-cols-2">
          <div className="space-y-4">
            {stage === 'wire' && <WireHoldPanel f={f} />}
            {stage === 'report' ? <OneCasePanel f={f} now={now} /> : <PatternPaymentsPanel f={f} />}
          </div>
          <div className="space-y-4">
            {stage === 'wire' && <RomanceScriptPanel f={f} />}
            <PatternAnswersPanel />
          </div>
        </div>
      </div>
    </StaffWindow>
  )
}
