import { Banknote, PauseCircle } from 'lucide-react'
import { minutesBetween, money } from '../../ui/format'
import { Source, type Tone } from '../../ui/primitives'
import { when } from './helpers'
import { FactRow, Panel } from './parts'
import type { TakeoverFacts } from './takeoverFacts'
import { HOLD_HOURS } from './trickedFacts'
import type { TakeoverStage } from './TakeoverCase'

const railRule: Record<string, string> = {
  P2P: "P2P can't be recalled once sent, so it's paused before send.",
  ACH: `ACH can be held up to ${HOLD_HOURS} hours while Sound checks with the member.`,
  Wire: `A wire can be held up to ${HOLD_HOURS} hours while Sound checks with the member.`,
}

const moneyState: Record<TakeoverStage, { label: string; tone: Tone }> = {
  watching: { label: 'No payment yet', tone: 'neutral' },
  paused: { label: 'Paused before send', tone: 'warn' },
  asked: { label: 'Paused before send', tone: 'warn' },
  'not-me': { label: 'Paused before send', tone: 'warn' },
  secured: { label: 'Stopped. Never sent.', tone: 'safe' },
  'its-me': { label: 'Paused, member said yes', tone: 'safe' },
  released: { label: 'Released to recipient', tone: 'safe' },
}

const panelTitle: Partial<Record<TakeoverStage, string>> = {
  watching: 'Outgoing money',
  secured: 'Stopped payment',
  released: 'Released payment',
}

const chip: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-ink-2',
  brand: 'bg-brand-soft text-brand',
  safe: 'bg-safe-soft text-safe',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
}

export function MoneyPanel({ f, stage }: { f: TakeoverFacts; stage: TakeoverStage }) {
  const { hit, recipientAdded, followUp } = f
  const state = moneyState[stage]
  const rail = stage === 'watching' ? recipientAdded.rail : hit.rail
  const rule = railRule[rail] ?? 'Paused before send while Sound checks with the member.'
  return (
    <Panel title={panelTitle[stage] ?? 'Paused payment'} icon={<Banknote size={14} />}>
      {stage === 'watching' ? (
        <div className="rounded-xl bg-slate-50 px-4 py-3.5 text-sm text-ink-2">
          No payment to {recipientAdded.recipientId} yet. If one starts, it pauses before it is sent.
          <div className="mt-1">
            <Source ids={recipientAdded.id} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="num font-display text-[44px] leading-none tracking-tight text-ink">
                {money(hit.amount)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-ink-3">
                <span className="font-mono">{hit.paymentId}</span>
                <Source ids={hit.id} />
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${chip[state.tone]}`}>
              <PauseCircle size={13} />
              {state.label}
            </span>
          </div>
          <div className="mt-3 divide-y divide-line/70 border-t border-line/70">
            <FactRow label="Rail">{hit.rail}</FactRow>
            <FactRow label="Started">
              <span className="font-mono">{when(hit, hit)}</span> · {hit.channel}
            </FactRow>
            <FactRow label="To">
              <span className="font-mono">{hit.recipientId}</span>{' '}
              <span className="text-ink-3">
                new, added {minutesBetween(recipientAdded.at, hit.at)} min before
              </span>
            </FactRow>
          </div>
        </>
      )}
      <p className="mt-3 rounded-xl bg-brand-soft/60 px-3 py-2 text-xs leading-relaxed text-brand">{rule}</p>
      {followUp && stage !== 'watching' && stage !== 'released' && (
        <p className="mt-2 text-xs leading-relaxed text-ink-3">
          Without a lock, the kit shows a second {followUp.rail} payment of{' '}
          {money(followUp.amount)} to the same recipient{' '}
          {minutesBetween(hit.at, followUp.at)} minutes later.{' '}
          {stage === 'secured' ? 'The lock stops it.' : 'Locking the account stops it.'}{' '}
          <Source ids={followUp.id} />
        </p>
      )}
    </Panel>
  )
}
