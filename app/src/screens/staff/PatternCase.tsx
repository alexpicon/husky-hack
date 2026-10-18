import { History, Quote } from 'lucide-react'
import { motion } from 'motion/react'
import type { KitEvent } from '../../data/kit'
import { useReportedCase } from '../../report/report'
import { ReportBanner } from '../../report/ReportBanner'
import { StaffWindow } from '../../ui/devices'
import { clock, day, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { Timeline, type TimelineItem } from '../../ui/timeline'
import { MichaelCheckSync } from '../michael/checkStore'
import { MICHAEL, MICHAEL_NAME, michaelFacts, patternFact, wireFact, type MichaelFacts } from '../michael/facts'
import { shortDate } from './helpers'
import { CaseHeader, Panel, StatusPill } from './parts'
import { PatternAnswersPanel, PatternPaymentsPanel, RomanceScriptPanel, WireHoldPanel } from './PatternPanels'

/** pattern: the card on his 4th growing P2P. wire: his first wire, held. report: the day he reports. */
export type PatternStage = 'pattern' | 'wire' | 'report'

/** What happened in the kit up to `now`, with the two moments Second Look adds marked as such. */
function kitTimeline(f: MichaelFacts, now: Date): TimelineItem[] {
  const warned = (paymentId: string) =>
    f.warnings.some((w) => w.paymentId === paymentId && w.memberResponse === 'Confirmed Intended')
  const marks = new Map<KitEvent, TimelineItem>([
    [f.card, { time: shortDate(f.card.at), label: 'With Second Look: the pattern card', detail: 'Before this payment sends. No hold.', tone: 'brand' }],
    [f.wire, { time: shortDate(f.wire.at), label: 'With Second Look: the wire held for a call', detail: `Until ${clock(f.holdEnds)}. He decides.`, tone: 'warn' }],
  ])
  const items = [...f.run, ...f.wires]
    .filter((e) => e.at <= now)
    .flatMap((e): TimelineItem[] => {
      const payment = {
        time: shortDate(e.at),
        label: `${e.rail} ${money(e.amount)} to ${e.recipientId}`,
        detail: `${clock(e.at)}${warned(e.paymentId) ? ' · warning shown, he confirmed' : ''}`,
        source: e.id,
      }
      const mark = marks.get(e)
      return mark ? [mark, payment] : [payment]
    })
  if (f.reported.at <= now) {
    items.push({
      time: shortDate(f.reported.at),
      label: 'In the kit: scam reported',
      detail: `${clock(f.reported.at)} · ${f.reported.channel}`,
      tone: 'danger',
      source: f.reported.id,
    })
  }
  return items
}

function Pill({ stage, reported }: { stage: PatternStage; reported: boolean }) {
  if (reported) return <StatusPill tone="danger">Scam reported</StatusPill>
  if (stage === 'wire') {
    return (
      <StatusPill tone="warn" live>
        On hold · call {MICHAEL_NAME}
      </StatusPill>
    )
  }
  if (stage === 'pattern') return <StatusPill tone="brand">Pattern card shown</StatusPill>
  return <StatusPill tone="neutral">No open case</StatusPill>
}

/** `now` is the story clock: the case never shows a kit event from after it. */
export function PatternCase({ stage, now }: { stage: PatternStage; now: Date }) {
  const f = michaelFacts()
  const reportedCase = useReportedCase(MICHAEL)
  const hit = stage === 'pattern' ? f.card : f.wire
  const kind = stage === 'report' ? `Romance pattern · ${day(now)}` : `${stage === 'wire' ? 'Wire hold' : 'Pattern card'} · ${day(hit.at)}`
  return (
    <StaffWindow title={`Member Protection · ${reportedCase ?? (stage === 'report' ? 'No open case' : `${stage === 'wire' ? 'Hold' : 'Card'} on ${hit.paymentId}`)}`}>
      <MichaelCheckSync />
      <div className="@container space-y-5">
        <CaseHeader
          name={MICHAEL_NAME}
          member={MICHAEL}
          kind={kind}
          caseId={reportedCase}
          pill={<Pill stage={stage} reported={reportedCase !== undefined} />}
        />
        <ReportBanner member={MICHAEL} />
        {stage !== 'report' && (
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
              {stage === 'wire' ? wireFact(f) : patternFact(f)}
            </p>
            <div className="mt-1.5">
              <Source ids={stage === 'wire' ? [f.wire.id, f.wirePayeeAdded.id] : f.run.map((e) => e.id)} />
            </div>
          </motion.div>
        )}
        <div className="grid items-start gap-4 @2xl:grid-cols-2">
          <div className="space-y-4">
            {stage === 'wire' && <WireHoldPanel f={f} />}
            {stage === 'report' ? (
              <Panel title="His payments, from the kit" icon={<History size={14} />}>
                <Timeline compact items={kitTimeline(f, now)} />
              </Panel>
            ) : (
              <PatternPaymentsPanel f={f} />
            )}
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
