import { LifeBuoy, Lock, Send } from 'lucide-react'
import { useState } from 'react'
import { useStory } from '../../story/engine'
import { ActionButton, Panel } from './parts'
import { actionPlan, stageHint } from './takeoverStages'
import type { TakeoverStage } from './TakeoverCase'

export function TakeoverActions({ name, stage }: { name: string; stage: TakeoverStage }) {
  const { next } = useStory()
  const [recovering, setRecovering] = useState(false)
  const plan = actionPlan[stage]
  return (
    <Panel
      title="Actions"
      aside={<span className="text-xs font-medium text-ink-2">{stageHint[stage]}</span>}
      delay={0.05}
    >
      <div className="grid gap-2.5 pt-1 @xl:grid-cols-3">
        <ActionButton
          look={plan.release}
          accent="safe"
          icon={<Send size={18} />}
          label="Release (after verifying)"
          hint={stage === 'its-me' ? 'YES came from a safe contact' : 'Needs a YES on a safe contact'}
          doneLabel="Released"
          onClick={stage === 'its-me' ? next : undefined}
        />
        <ActionButton
          look={plan.lock}
          accent="danger"
          icon={<Lock size={18} />}
          label="Keep stopped and lock account"
          hint={stage === 'not-me' ? 'Nothing has been sent' : 'If the member says it was not them'}
          doneLabel="Stopped and locked"
          onClick={stage === 'not-me' ? next : undefined}
        />
        <ActionButton
          look={recovering ? 'done' : plan.recover}
          accent="brand"
          icon={<LifeBuoy size={18} />}
          label="Start recovery"
          hint={`Help ${name} back in, by the card number or a branch`}
          doneLabel="Recovery started"
          onClick={() => setRecovering(true)}
        />
      </div>
    </Panel>
  )
}
