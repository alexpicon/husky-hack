import { motion } from 'motion/react'
import { HEADS_UP_WINDOW_HOURS } from '../data/jamesRules'
import { FOLLOW_UP_WINDOW_DAYS, PATTERN_MIN_RUN, PATTERN_PAYEE_MAX_AGE_DAYS } from '../data/michaelRules'
import { POLICY } from '../data/policy'
import { TRICKED_RECIPIENT_MAX_AGE_DAYS, TRICKED_RULES } from '../data/trickedRules'
import type { GroupResult } from '../data/triggers'
import { Card, Eyebrow, toneDot, type Tone } from '../ui/primitives'
import { columns, coverage, type ColumnKey } from './designCheck'

const ROWS: { group: string; label: string; kind: 'scam' | 'honest' }[] = [
  { group: 'Sound Impersonation + ATO', label: 'Takeover (Sarah)', kind: 'scam' },
  { group: 'Family Emergency', label: 'Family emergency (Linda)', kind: 'scam' },
  { group: 'Tech Support / Government Impersonation', label: 'Gov’t impersonation (James)', kind: 'scam' },
  { group: 'Romance / Investment', label: 'Romance (Michael)', kind: 'scam' },
  { group: 'Look-alike', label: 'Honest look-alikes', kind: 'honest' },
  { group: 'Routine', label: 'Routine members', kind: 'honest' },
]

const tricked = TRICKED_RULES[POLICY.lindaRule]
const trickedSub = `${tricked.sameDay ? 'day’s wires to one payee' : 'wire'} ≥ ${tricked.ratio}x 12-month 90th-percentile, payee added < ${TRICKED_RECIPIENT_MAX_AGE_DAYS} day ago`

const sessionSub = '; or a payee added today within 2 h of a reset, code or failed sign-in'
const stopSub = `reset + email or phone change + new recipient${POLICY.sessionRule ? sessionSub : ''}`

/** What a full stop waits for before the payment goes, as POLICY.fullStopRelease (D1) sets it. */
const stopDoes: Record<typeof POLICY.fullStopRelease, string> = {
  yes: 'Held; a YES from the number on file before the change releases it',
  callback: 'Held until a specialist calls the number on file before the change',
}

type Column = {
  key: ColumnKey
  label: string
  tone: Tone
  sub: string
  does: string
}

const COLUMNS: Column[] = [
  { key: 'stop', label: 'Full stop', tone: 'danger', sub: stopSub, does: stopDoes[POLICY.fullStopRelease] },
  {
    key: 'check',
    label: 'Light check',
    tone: 'warn',
    sub: 'reset + address change only + new recipient',
    does: 'One tap on the unchanged phone; released when they tap',
  },
  {
    key: 'linda',
    label: 'Linda’s rule',
    tone: 'brand',
    sub: trickedSub,
    does: 'Wire paused with a true fact; the member decides',
  },
  {
    key: 'headsUp',
    label: 'James’s heads-up',
    tone: 'safe',
    sub: `cash or wire within ${HEADS_UP_WINDOW_HOURS} h of a contact center call`,
    does: 'The teller sees the call and one question; no hold, the teller decides',
  },
  {
    key: 'pattern',
    label: 'Michael’s pattern card',
    tone: 'neutral',
    sub: `${PATTERN_MIN_RUN}th growing payment in a row to a payee added < ${PATTERN_PAYEE_MAX_AGE_DAYS} days ago`,
    does: `Late: earlier payments are gone. Advice; he decides. A wire to a new payee within ${FOLLOW_UP_WINDOW_DAYS} days is held for a call`,
  },
]

function Cell({ r, kind }: { r: GroupResult; kind: 'scam' | 'honest' }) {
  const share = r.total ? r.flagged / r.total : 0
  const color = r.flagged === 0 ? 'bg-slate-200' : kind === 'scam' ? 'bg-teal-500' : 'bg-amber-400'
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 2xl:w-20">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(share * 100, r.flagged ? 6 : 0)}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <span className="num font-mono text-sm whitespace-nowrap">
        <b className={r.flagged ? 'text-ink' : 'text-ink-3'}>{r.flagged}</b>
        <span className="text-ink-3"> / {r.total}</span>
      </span>
    </div>
  )
}

function Headline() {
  const c = coverage()
  return (
    <>
      <h2 className="mt-2 font-display text-[32px] leading-tight">
        With these rules we act on <span className="num text-safe">{c.actedOn} of {c.scam}</span> kit
        scam journeys and stop <span className="num text-safe">{c.stopped} of {c.honest}</span> honest
        members; <span className="num">{c.asked} of {c.honest}</span> get one tap or a card.
      </h2>
      <p className="mt-2 text-sm text-ink-2">
        The light check asks the <span className="num">{c.moved}</span> honest members who moved for one
        tap, and the pattern card shows to <span className="num">{c.carded}</span> honest look-alikes, who
        can tap “This is my own account” once; <span className="num">{c.honest - c.asked} of {c.honest}</span>{' '}
        see nothing.
      </p>
      <p className="mt-1 text-xs font-medium text-warn">
        Synthetic data, about {c.scamShare}% scam victims by design. This shows how the design behaves,
        not real accuracy.
      </p>
    </>
  )
}

export function ResultsMatrix() {
  const results = columns()
  return (
    <Card className="p-7">
      <Eyebrow>Design check · computed live from HuskyHack_Synthetic_Events_v2.csv</Eyebrow>
      <Headline />
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <caption className="sr-only">
            Members each Second Look rule acts on, by who they really are
          </caption>
          <thead>
            <tr className="align-bottom text-xs text-ink-3">
              <th scope="col" className="pr-4 pb-3 font-medium">
                Who they really are (Member Key)
              </th>
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col" className="w-[16%] pr-4 pb-3 align-top font-medium">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <span className={`size-2 rounded-full ${toneDot[c.tone]}`} aria-hidden />
                    {c.label}
                  </div>
                  <div className="mt-0.5">{c.sub}</div>
                  <div className="mt-0.5 text-ink-2">{c.does}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.group} className="border-t border-line">
                <th scope="row" className="py-2.5 pr-4 text-sm font-medium">
                  <span
                    className={`mr-2 inline-block size-2 rounded-full ${row.kind === 'scam' ? 'bg-rose-400' : 'bg-teal-400'}`}
                    aria-hidden
                  />
                  {row.label}
                </th>
                {COLUMNS.map((c) => {
                  const r = results[c.key].find((x) => x.group === row.group)
                  return (
                    <td key={c.key} className="py-2.5 pr-4">
                      {r && <Cell r={r} kind={row.kind} />}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
