import { KeyRound } from 'lucide-react'
import { money } from '../ui/format'
import { Badge } from '../ui/primitives'
import { answerFor, KEY_FILE } from './memberAnswer'

/** What really happened: the member's Member Key row, kept apart from what the rules saw. */
export function ReplayAnswer({ member }: { member: string }) {
  const a = answerFor(member)
  return (
    <section className="self-start rounded-2xl bg-warn-soft/50 p-5 ring-1 ring-amber-200" aria-labelledby="replay-key">
      <h4 id="replay-key" className="flex items-center gap-2 font-semibold text-ink">
        <KeyRound size={16} aria-hidden className="text-warn" />
        What really happened (answer key, used only for scoring)
      </h4>
      <p className="mt-1 text-xs text-ink-3">
        From {KEY_FILE}. The rules never see it; the Design check uses it only to score them.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={a.scam ? 'danger' : 'safe'}>{a.scam ? 'Scam victim' : 'Honest member'}</Badge>
        <Badge>{a.group}</Badge>
        <Badge tone={a.netLoss > 0 ? 'danger' : 'neutral'}>
          Net loss <span className="num">{money(a.netLoss)}</span>
        </Badge>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        {a.fields.map((f) => (
          <div key={f.column}>
            <dt className="font-mono text-[11px] text-ink-3">{f.column}</dt>
            <dd className={f.value ? 'num text-ink-2' : 'text-ink-3 italic'}>{f.value || 'blank'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
