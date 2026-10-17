import { ArrowUpRight, FolderOpen, Hourglass, Send } from 'lucide-react'
import { useState } from 'react'
import { plural } from './helpers'
import { ActionButton, Panel } from './parts'
import { HOLD_HOURS } from './trickedFacts'

export function TrickedActions({ name }: { name: string }) {
  const [picked, setPicked] = useState<string | null>(null)
  const pick = (label: string) => () => setPicked(label)
  const hold = `Keep holding (up to ${HOLD_HOURS}h)`
  return (
    <Panel
      title="Actions"
      delay={0.05}
      aside={
        <span className="text-xs font-medium text-ink-2">
          {picked ? `Preview: "${picked}" goes live Sunday.` : `${name} decides: Sound can delay and advise, not refuse.`}
        </span>
      }
    >
      <div className="grid gap-2.5 pt-1 @xl:grid-cols-4">
        <ActionButton look="on" accent="safe" icon={<Send size={18} />} label="Release" hint="If she still wants to send" onClick={pick('Release')} />
        <ActionButton look="recommended" accent="warn" icon={<Hourglass size={18} />} label={hold} hint={`Up to ${plural(HOLD_HOURS, 'hour')} in total`} onClick={pick(hold)} />
        <ActionButton look="on" accent="danger" icon={<ArrowUpRight size={18} />} label="Escalate" hint="Fraud specialist" onClick={pick('Escalate')} />
        <ActionButton look="on" accent="brand" icon={<FolderOpen size={18} />} label="Open a case" hint="Log what she shared" onClick={pick('Open a case')} />
      </div>
    </Panel>
  )
}
