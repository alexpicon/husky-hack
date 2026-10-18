import { Banknote, Check, EyeOff, Hourglass, Landmark, MessageCircleHeart, ScanFace, TrendingUp } from 'lucide-react'
import {
  FOLLOW_UP_PAYEE_MAX_AGE_DAYS,
  FOLLOW_UP_WINDOW_DAYS,
  PATTERN_MIN_RUN,
  PATTERN_PAYEE_MAX_AGE_DAYS,
} from '../../data/michaelRules'
import { clock, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { romanceFit, ROMANCE_OPTIONS, staffView } from '../michael/check'
import { useMichaelCheck } from '../michael/checkState'
import { callLine, hour, MICHAEL_NAME, romanceScript, type MichaelFacts } from '../michael/facts'
import { shortDate } from './helpers'
import { FactRow, Panel, StatusPill } from './parts'
import { HOLD_HOURS } from './trickedFacts'

type Props = { f: MichaelFacts }

export function PatternPaymentsPanel({ f }: Props) {
  return (
    <Panel
      title={`Growing payments to ${f.card.recipientId}`}
      icon={<TrendingUp size={14} />}
      aside={<StatusPill tone="brand">Card shown · no hold</StatusPill>}
    >
      <ol className="divide-y divide-line/70 border-y border-line/70">
        <li className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
          <span className="text-ink-3">
            {shortDate(f.cardPayeeAdded.at)}, {clock(f.cardPayeeAdded.at)} · payee added
          </span>
          <Source ids={f.cardPayeeAdded.id} />
        </li>
        {f.run.map((e) => (
          <li key={e.id} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span className="text-ink-2">
              {shortDate(e.at)}, {clock(e.at)} · {e.rail} <Source ids={e.id} />
            </span>
            <span className={`num font-semibold ${e === f.card ? 'text-danger' : 'text-ink'}`}>{money(e.amount)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        <span className="font-semibold text-ink-2">Rule:</span> the {PATTERN_MIN_RUN}th or later payment in a row,
        each bigger than the last, to a payee added less than {PATTERN_PAYEE_MAX_AGE_DAYS} days earlier. On P2P it
        shows a card and holds nothing. {money(f.alreadySent)} had gone to this payee before the card.
      </p>
    </Panel>
  )
}

/** His taps reach staff only if he shares them; marking his own account always shows, since it stops the card. */
export function PatternAnswersPanel() {
  const { state } = useMichaelCheck()
  const { taps, ownAccount } = staffView(state)
  const fit = romanceFit(taps)
  const pill = fit ? (
    <StatusPill tone="danger">Taps fit a romance scam</StatusPill>
  ) : taps.length ? (
    <StatusPill tone="brand">Answers shared</StatusPill>
  ) : (
    <StatusPill tone="neutral">Answers private</StatusPill>
  )
  return (
    <Panel title="Silent check" icon={<ScanFace size={14} />} aside={pill} delay={0.05}>
      {ownAccount && (
        <p className="mb-3 flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-ink ring-1 ring-line ring-inset">
          <Landmark size={16} className="mt-0.5 shrink-0 text-ink-3" />
          He marked this payee as his own account. The card won't show for it again.
        </p>
      )}
      {taps.length > 0 ? (
        <ul className="space-y-1.5">
          {ROMANCE_OPTIONS.filter((o) => taps.includes(o.id)).map((o) => {
            const fits = fit?.includes(o.id)
            return (
              <li
                key={o.id}
                className={`flex items-start gap-2.5 rounded-xl px-3 py-2 text-sm text-ink ${fits ? 'bg-danger-soft/70' : 'bg-slate-50'}`}
              >
                <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-white ${fits ? 'bg-rose-500' : 'bg-slate-400'}`}>
                  <Check size={10} strokeWidth={3} />
                </span>
                {o.label}
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex items-start gap-3 rounded-xl bg-brand-soft/60 px-3.5 py-3">
          <EyeOff size={18} className="mt-0.5 shrink-0 text-brand" />
          <p className="text-xs leading-relaxed text-ink-2">
            {MICHAEL_NAME} taps what is true on his phone. Staff see his answers only if he shares them. A
            private check tells staff nothing either way.
          </p>
        </div>
      )}
    </Panel>
  )
}

export function WireHoldPanel({ f }: Props) {
  const { wire, wirePayeeAdded } = f
  const cancelled = useMichaelCheck().state.wire === 'cancel'
  const pill = cancelled ? (
    <StatusPill tone="safe">Cancelled by {MICHAEL_NAME} · not sent</StatusPill>
  ) : (
    <StatusPill tone="warn" live>
      On hold
    </StatusPill>
  )
  return (
    <Panel title="The wire" icon={<Banknote size={14} />} aside={pill}>
      <div className="num font-display text-[40px] leading-none tracking-tight text-ink">{money(wire.amount)}</div>
      <div className="mt-2 flex items-center gap-2 text-xs text-ink-3">
        <span className="font-mono">{wire.paymentId}</span>
        <Source ids={wire.id} />
      </div>
      <div className="mt-3 divide-y divide-line/70 border-t border-line/70">
        <FactRow label="Started">
          <span className="font-mono">{clock(wire.at)}</span> · {wire.channel}
        </FactRow>
        <FactRow label="Last wire">
          <span className="text-danger">{f.firstWireEver ? 'None on record' : `${wire.daysSinceLastSameRail} days ago`}</span>
        </FactRow>
        <FactRow label="To">
          <span className="font-mono">{wire.recipientId}</span>{' '}
          <span className="text-danger">added {clock(wirePayeeAdded.at)}</span> <Source ids={wirePayeeAdded.id} />
        </FactRow>
        <FactRow label="Held until">
          <span className="inline-flex items-center gap-1.5 font-mono text-warn">
            <Hourglass size={13} /> {clock(f.holdEnds)}
          </span>
        </FactRow>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        <span className="font-semibold text-ink-2">Rule:</span> a wire or external transfer to a different payee
        added less than {FOLLOW_UP_PAYEE_MAX_AGE_DAYS} days earlier, within {FOLLOW_UP_WINDOW_DAYS} days of a
        pattern card. Held up to {HOLD_HOURS} hours for a call, and never past {hour(f.callsEnd)}, when calls
        end. What he reads: "{callLine(f)}"
      </p>
    </Panel>
  )
}

export function RomanceScriptPanel({ f }: Props) {
  return (
    <Panel title="Call script · Romance scam" icon={<MessageCircleHeart size={14} />} delay={0.05}>
      <ol className="space-y-2">
        {romanceScript(f).map((line, i) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink">
            <span className="num mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-safe-soft font-mono text-[11px] font-semibold text-safe">
              {i + 1}
            </span>
            {line}
          </li>
        ))}
      </ol>
    </Panel>
  )
}
