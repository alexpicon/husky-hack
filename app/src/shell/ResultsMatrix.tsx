import { motion } from 'motion/react'
import { POLICY } from '../data/policy'
import { TRICKED_RECIPIENT_MAX_AGE_DAYS, TRICKED_RULES } from '../data/trickedRules'
import { evaluate, isTakeover, isTricked, type GroupResult } from '../data/triggers'
import { Card, Eyebrow } from '../ui/primitives'

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

const COLUMNS = [
  { key: 'takeover', label: 'Takeover trigger', sub: 'reset + contact change + new recipient', results: evaluate(isTakeover) },
  { key: 'tricked', label: 'Tricked trigger', sub: trickedSub, results: evaluate(isTricked) },
]

function Cell({ r, kind }: { r: GroupResult; kind: 'scam' | 'honest' }) {
  const share = r.total ? r.flagged / r.total : 0
  const color = r.flagged === 0 ? 'bg-slate-200' : kind === 'scam' ? 'bg-teal-500' : 'bg-amber-400'
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(share * 100, r.flagged ? 6 : 0)}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <span className="num w-14 font-mono text-sm">
        <b className="text-ink">{r.flagged}</b>
        <span className="text-ink-3"> / {r.total}</span>
      </span>
    </div>
  )
}

export function ResultsMatrix() {
  return (
    <Card className="p-7">
      <Eyebrow>Design check · computed live from HuskyHack_Synthetic_Events_v2.csv</Eyebrow>
      <h2 className="mt-2 font-display text-3xl">Members each trigger would pause</h2>
      <table className="mt-6 w-full text-left">
        <thead>
          <tr className="text-xs text-ink-3">
            <th className="pb-3 font-medium">Who they really are (Member Key)</th>
            {COLUMNS.map((c) => (
              <th key={c.key} className="pb-3 font-medium">
                <div className="font-semibold text-ink-2">{c.label}</div>
                <div>{c.sub}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.group} className="border-t border-line">
              <td className="py-3 pr-4 text-sm font-medium">
                <span
                  className={`mr-2 inline-block size-2 rounded-full ${row.kind === 'scam' ? 'bg-rose-400' : 'bg-teal-400'}`}
                />
                {row.label}
              </td>
              {COLUMNS.map((c) => {
                const r = c.results.find((x) => x.group === row.group)
                return <td key={c.key} className="py-3">{r && <Cell r={r} kind={row.kind} />}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-5 text-xs leading-relaxed text-ink-3">
        The kit is about 41% scam victims by design; real life is far lower. These numbers show how
        the design behaves on the kit. They are not accuracy claims.
      </p>
    </Card>
  )
}
