import { ArrowUpRight, FolderOpen, Hourglass, Send } from 'lucide-react'
import { useState } from 'react'
import { plural } from './helpers'
import { ActionButton, Panel } from './parts'
import { HOLD_HOURS } from './trickedFacts'

export function TrickedActions({ name }: { name: string }) {
  const [picked, setPicked] = useState<string | null>(null)
  const hold = `Keep holding (up to ${HOLD_HOURS}h)`
  const actions = [
    { label: 'Release', accent: 'safe', icon: <Send size={18} />, hint: 'If she still wants to send' },
    { label: hold, accent: 'warn', icon: <Hourglass size={18} />, hint: `Up to ${plural(HOLD_HOURS, 'hour')} in total` },
    { label: 'Escalate', accent: 'danger', icon: <ArrowUpRight size={18} />, hint: 'To a fraud specialist' },
    { label: 'Open a case', accent: 'brand', icon: <FolderOpen size={18} />, hint: 'Log the hold and what she shares' },
  ] as const
  return (
    <Panel
      title="Actions"
      delay={0.05}
      aside={
        picked && (
          <span className="text-xs font-medium text-ink-3">Preview: "{picked}" goes live Sunday.</span>
        )
      }
    >
      <div className="grid grid-cols-2 gap-2.5 pt-1 @3xl:grid-cols-4">
        {actions.map((a) => (
          <ActionButton
            key={a.label}
            look={a.label === hold ? 'recommended' : 'on'}
            accent={a.accent}
            icon={a.icon}
            label={a.label}
            hint={a.hint}
            onClick={() => setPicked(a.label)}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-2">
        <span className="font-semibold text-ink">{name} decides:</span> Sound can delay and advise,
        not refuse.
      </p>
    </Panel>
  )
}
