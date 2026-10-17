import { History } from 'lucide-react'
import type { KitEvent } from '../../data/kit'
import { clock, day, money } from '../../ui/format'
import type { Tone } from '../../ui/primitives'
import { Timeline, type TimelineItem } from '../../ui/timeline'
import { Panel } from './parts'
import type { TakeoverFacts } from './takeoverFacts'

const labels: Record<string, { label: string; tone: Tone }> = {
  'Failed Login': { label: 'Failed sign-in', tone: 'warn' },
  'One-Time Code Sent': { label: 'One-time code sent', tone: 'neutral' },
  'Password Reset': { label: 'Password reset', tone: 'danger' },
  Login: { label: 'Signed in', tone: 'neutral' },
  'Email Change': { label: 'Email changed', tone: 'danger' },
  'Phone Change': { label: 'Phone number changed', tone: 'danger' },
  'Address Change': { label: 'Address changed', tone: 'danger' },
  'Profile Change Alert Sent': { label: 'Change alert sent', tone: 'brand' },
  'Recipient Added': { label: 'New recipient added', tone: 'danger' },
}

function toItem(e: KitEvent, f: TakeoverFacts, confirmed: boolean): TimelineItem {
  if (e === f.hit) {
    return {
      time: clock(e.at),
      label: confirmed ? 'Payment started, paused' : 'Payment started, paused before send',
      detail: `${money(e.amount)} ${e.rail} · ${e.paymentId}`,
      tone: confirmed ? 'safe' : 'warn',
      source: e.id,
    }
  }
  const known = labels[e.type]
  if (!known) throw new Error(`Staff console: no timeline label for ${e.type} (${e.id})`)
  const detail =
    e.type === 'Profile Change Alert Sent'
      ? e.note || undefined
      : e.type === 'Recipient Added'
        ? `${e.rail} · ${e.recipientId}`
        : undefined
  return {
    time: clock(e.at),
    label: known.label,
    detail,
    tone: confirmed && known.tone === 'danger' ? 'safe' : known.tone,
    source: e.id,
  }
}

export function ChangeTimeline({
  f,
  watching,
  confirmed,
}: {
  f: TakeoverFacts
  watching: boolean
  confirmed: boolean
}) {
  const shown = watching ? f.trail.filter((e) => e !== f.hit) : f.trail
  const days = new Map<string, KitEvent[]>()
  for (const e of shown) days.set(day(e.at), [...(days.get(day(e.at)) ?? []), e])
  return (
    <Panel
      title="Account changes"
      icon={<History size={14} />}
      delay={0.05}
      aside={
        confirmed ? (
          <span className="text-xs font-semibold text-safe">Member confirmed these</span>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {[...days].map(([label, list]) => (
          <div key={label}>
            <div className="mb-2 text-xs font-semibold text-ink-2">{label}</div>
            <Timeline compact items={list.map((e) => toItem(e, f, confirmed))} />
          </div>
        ))}
      </div>
    </Panel>
  )
}
