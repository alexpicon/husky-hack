import { Building2, CreditCard, Home, Mail, Phone, ShieldCheck, ShieldOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { Source } from '../../ui/primitives'
import { when } from './helpers'
import { Panel } from './parts'
import { priorContact, type ContactKind, type TakeoverFacts } from './takeoverFacts'

const icons: Record<ContactKind, ReactNode> = {
  email: <Mail size={15} />,
  phone: <Phone size={15} />,
  address: <Home size={15} />,
}

const nouns: Record<ContactKind, string> = { email: 'email', phone: 'phone number', address: 'address' }

type SafeContact = { icon: ReactNode; label: string; ids: string[]; asked?: boolean }

function safeContacts(f: TakeoverFacts): SafeContact[] {
  return [
    { icon: icons.phone, ...priorContact(f, 'phone', 'Phone number'), asked: true },
    { icon: icons.email, ...priorContact(f, 'email', 'Email') },
    { icon: <CreditCard size={15} />, label: "The number on the member's card", ids: [] },
    { icon: <Building2 size={15} />, label: 'Any Sound branch', ids: [] },
  ]
}

export function ContactsPanel({ f, asked }: { f: TakeoverFacts; asked: boolean }) {
  return (
    <Panel title="Contact details" icon={<Phone size={14} />} delay={0.05}>
      <div className="@container">
        <div className="grid gap-3 @sm:grid-cols-2">
          <div className="rounded-xl bg-danger-soft/70 p-3 ring-1 ring-rose-100">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-danger">
              <ShieldOff size={13} />
              Just changed - don't use
            </div>
            <ul className="space-y-2">
              {f.changes.map(({ kind, event }) => (
                <li key={event.id} className="flex items-start gap-2 text-sm text-ink">
                  <span className="mt-0.5 text-danger">{icons[kind]}</span>
                  <span>
                    New {nouns[kind]}
                    <span className="block text-xs text-ink-3">
                      <span className="num font-mono">{when(event, f.hit)}</span> <Source ids={event.id} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-safe-soft/70 p-3 ring-1 ring-teal-100">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-safe">
              <ShieldCheck size={13} />
              Safe to use
            </div>
            <ul className="space-y-2">
              {safeContacts(f).map((c) => (
                <li key={c.label} className="flex items-start gap-2 text-sm text-ink">
                  <span className="mt-0.5 text-safe">{c.icon}</span>
                  <span className="min-w-0">
                    {c.label}
                    {c.ids.length > 0 && (
                      <span className="ml-1.5">
                        <Source ids={c.ids} />
                      </span>
                    )}
                    {asked && c.asked && (
                      <span className="mt-0.5 block text-xs font-semibold text-safe">"Was this you?" sent here</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  )
}
