import { LifeBuoy, Lock, Send } from 'lucide-react'
import { useState } from 'react'
import { useStory } from '../../story/engine'
import { ActionButton, Panel } from './parts'
import { actionPlan, releaseHint, stageHint, yesReleases } from './takeoverStages'
import type { TakeoverStage } from './TakeoverCase'

export function TakeoverActions({
  name,
  stage,
  fullStop,
}: {
  name: string
  stage: TakeoverStage
  fullStop: boolean
}) {
  const { next } = useStory()
  const [recovering, setRecovering] = useState(false)
  const plan = actionPlan[stage]
  const yesOk = yesReleases(fullStop)
  return (
    <Panel
      title="Actions"
      aside={<span className="text-xs font-medium text-ink-2">{stageHint(stage, yesOk)}</span>}
      delay={0.05}
    >
      <div className="grid gap-2.5 pt-1 @2xl:grid-cols-3">
        <ActionButton
          look={plan.release}
          accent="safe"
          icon={<Send size={18} />}
          label="Release (after verifying)"
          hint={releaseHint(stage, yesOk)}
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
