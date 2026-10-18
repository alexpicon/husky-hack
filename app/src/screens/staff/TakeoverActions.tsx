import { LifeBuoy, Lock, PhoneCall, Send } from 'lucide-react'
import { useState } from 'react'
import { useStory } from '../../story/engine'
import { ActionButton, Panel } from './parts'
import { actionsFor, releaseHint, stageHint, yesReleases } from './takeoverStages'
import type { TakeoverStage } from './TakeoverCase'

export function TakeoverActions({
  name,
  stage,
  fullStop,
  onCallbackDone,
}: {
  name: string
  stage: TakeoverStage
  fullStop: boolean
  /** The specialist reached the member on the number on file before the change, and they confirmed. */
  onCallbackDone?: () => void
}) {
  const { next } = useStory()
  const [recovering, setRecovering] = useState(false)
  const yesOk = yesReleases(fullStop)
  const plan = actionsFor(stage, yesOk)
  const awaitingCallback = stage === 'its-me' && !yesOk
  return (
    <Panel
      title="Actions"
      aside={<span className="text-xs font-medium text-ink-2">{stageHint(stage, yesOk)}</span>}
      delay={0.05}
    >
      {awaitingCallback && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-warn-soft/70 px-3.5 py-2.5 ring-1 ring-amber-200 ring-inset">
          <span className="min-w-0 flex-1 text-sm font-semibold text-warn">
            Member said YES on the number on file before the change: specialist callback required
            before release
          </span>
          <button
            type="button"
            onClick={onCallbackDone}
            disabled={!onCallbackDone}
            className="flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-40"
          >
            <PhoneCall size={15} aria-hidden />
            Callback done: confirmed
          </button>
        </div>
      )}
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
          hint={
            stage === 'not-me'
              ? 'Nothing has been sent'
              : awaitingCallback
                ? 'If the callback finds it was not them'
                : 'If the member says it was not them'
          }
          doneLabel="Stopped and locked"
          onClick={stage === 'not-me' || awaitingCallback ? next : undefined}
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
