import { Check, KeyRound, Radar, UserPlus, UserRoundPen } from 'lucide-react'
import type { ReactNode } from 'react'
import { money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { when } from './helpers'
import { Panel } from './parts'
import type { ContactKind, TakeoverFacts } from './takeoverFacts'

const kindLabel: Record<ContactKind, string> = { email: 'Email', phone: 'Phone', address: 'Address' }

type Signal = {
  icon: ReactNode
  label: string
  on: boolean
  detail: ReactNode
  ids: string[]
}

export function SignalsPanel({ f, watching }: { f: TakeoverFacts; watching: boolean }) {
  const { hit, reset, changes, recipientAdded, signals } = f
  const list: Signal[] = [
    {
      icon: <KeyRound size={16} />,
      label: 'Password reset',
      on: signals.passwordReset,
      detail: when(reset, hit),
      ids: [reset.id],
    },
    {
      icon: <UserRoundPen size={16} />,
      label: 'Contact change',
      on: signals.contactChange,
      detail: changes.map((c) => `${kindLabel[c.kind]} ${when(c.event, hit)}`).join(' · '),
      ids: changes.map((c) => c.event.id),
    },
    {
      icon: <UserPlus size={16} />,
      label: 'Payment to a new recipient',
      on: !watching && signals.newRecipient,
      detail: watching
        ? `${recipientAdded.recipientId} added ${when(recipientAdded, hit)} · no payment yet`
        : `${money(hit.amount)} at ${when(hit, hit)} to ${hit.recipientId}, added ${when(recipientAdded, hit)}`,
      ids: watching ? [recipientAdded.id] : [recipientAdded.id, hit.id],
    },
  ]
  const lit = list.filter((s) => s.on).length
  const all = lit === list.length
  return (
    <Panel
      title="Takeover signals"
      icon={<Radar size={14} />}
      aside={
        <span className={`text-xs font-semibold ${all ? 'text-danger' : 'text-ink-3'}`}>
          {lit} of {list.length} signals
        </span>
      }
    >
      <div className="mb-3 flex gap-1" aria-hidden>
        {list.map((s) => (
          <span key={s.label} className={`h-1.5 flex-1 rounded-full ${s.on ? 'bg-rose-500' : 'bg-slate-200'}`} />
        ))}
      </div>
      <ul className="space-y-1.5">
        {list.map((s) => (
          <li
            key={s.label}
            className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${s.on ? 'bg-danger-soft/70' : 'bg-slate-50'}`}
          >
            <span className={`mt-0.5 ${s.on ? 'text-danger' : 'text-ink-3'}`}>{s.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">{s.label}</div>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-xs text-ink-2">
                <span className="num font-mono">{s.detail}</span>
                <Source ids={s.ids} />
              </div>
            </div>
            <span
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${s.on ? 'bg-rose-500 text-white' : 'ring-1 ring-slate-300 ring-inset'}`}
              aria-label={s.on ? 'Signal present' : 'Signal not yet present'}
            >
              {s.on && <Check size={12} strokeWidth={3} />}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        <span className="font-semibold text-ink-2">Rule:</span> a recent password reset, a recent
        change to email, phone or address, and a payment to a new recipient. When all three line
        up, the payment pauses before it is sent.
      </p>
    </Panel>
  )
}
