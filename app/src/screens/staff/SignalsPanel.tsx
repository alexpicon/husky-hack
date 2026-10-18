import { Check, KeyRound, Radar, UserPlus, UserRoundPen } from 'lucide-react'
import type { ReactNode } from 'react'
import { money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { when } from './helpers'
import { Panel } from './parts'
import type { ContactKind, TakeoverFacts } from './takeoverFacts'
import { yesReleases } from './takeoverStages'
import { TakeoverTier } from './TakeoverTier'

const kindLabel: Record<ContactKind, string> = { email: 'Email', phone: 'Phone', address: 'Address' }

const lookAlert = { bar: 'bg-rose-500', row: 'bg-danger-soft/70', icon: 'text-danger', check: 'bg-rose-500 text-white' }
const lookCheck = { bar: 'bg-amber-500', row: 'bg-warn-soft/70', icon: 'text-warn', check: 'bg-amber-500 text-white' }
const lookConfirmed = { bar: 'bg-teal-500', row: 'bg-safe-soft/70', icon: 'text-safe', check: 'bg-teal-500 text-white' }

type Signal = {
  icon: ReactNode
  label: string
  on: boolean
  detail: ReactNode
  ids: string[]
}

export function SignalsPanel({
  f,
  watching,
  confirmed,
}: {
  f: TakeoverFacts
  watching: boolean
  confirmed: boolean
}) {
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
  const on = confirmed ? lookConfirmed : f.fullStop ? lookAlert : lookCheck
  const lit = list.filter((s) => s.on).length
  const all = lit === list.length
  return (
    <Panel
      title="Takeover signals"
      icon={<Radar size={14} />}
      aside={
        <span className={`text-xs font-semibold ${confirmed ? 'text-safe' : !all ? 'text-ink-3' : f.fullStop ? 'text-danger' : 'text-warn'}`}>
          {lit} of {list.length} signals{confirmed && ' · member confirmed'}
        </span>
      }
    >
      {!watching && <TakeoverTier f={f} />}
      <div className="mb-3 flex gap-1" aria-hidden>
        {list.map((s) => (
          <span key={s.label} className={`h-1.5 flex-1 rounded-full ${s.on ? on.bar : 'bg-slate-200'}`} />
        ))}
      </div>
      <ul className="space-y-1.5">
        {list.map((s) => (
          <li
            key={s.label}
            className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${s.on ? on.row : 'bg-slate-50'}`}
          >
            <span className={`mt-0.5 ${s.on ? on.icon : 'text-ink-3'}`}>{s.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">{s.label}</div>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-xs text-ink-2">
                <span className="num font-mono">{s.detail}</span>
                <Source ids={s.ids} />
              </div>
            </div>
            <span
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${s.on ? on.check : 'ring-1 ring-slate-300 ring-inset'}`}
              aria-label={s.on ? 'Signal present' : 'Signal not yet present'}
            >
              {s.on && <Check size={12} strokeWidth={3} />}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        <span className="font-semibold text-ink-2">Rule:</span> a recent password reset, a contact
        change in the 30 days before, and a payment to a new recipient pause the payment before it
        is sent. Email or phone changed and not confirmed on the prior contact: a full stop,{' '}
        {yesReleases(true)
          ? 'released by a YES on the prior contact.'
          : 'released only after a specialist calls the number on file before the change.'}{' '}
        Only the address changed: one tap on the unchanged phone.
      </p>
    </Panel>
  )
}
