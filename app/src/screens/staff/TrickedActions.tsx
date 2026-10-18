import { ArrowUpRight, FolderOpen, Hourglass, Lock, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'
import { clock, money } from '../../ui/format'
import type { Tone } from '../../ui/primitives'
import { caseActions, useLindaCase, type StaffAction } from '../linda/lindaCase'
import { outcomeCopy, RELEASE_REASONS } from '../linda/outcomes'
import { plural } from './helpers'
import { ActionButton, Panel, StatusPill, type ActionLook } from './parts'
import { HOLD_HOURS, type TrickedFacts } from './trickedFacts'

const banner: Record<Tone, string> = {
  safe: 'bg-safe-soft ring-teal-200 text-safe',
  brand: 'bg-brand-soft ring-indigo-200 text-brand',
  neutral: 'bg-slate-50 ring-slate-200 text-ink-2',
  warn: 'bg-warn-soft ring-amber-200 text-warn',
  danger: 'bg-danger-soft ring-rose-200 text-danger',
}

function ReleaseReason({ f, now, onBack }: { f: TrickedFacts; now: Date; onBack: () => void }) {
  const { update } = useLindaCase()
  const [reason, setReason] = useState<string | null>(null)
  return (
    <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-line ring-inset">
      <p id="release-reason" className="text-sm font-semibold text-ink">
        Why release it? The reason goes on the case.
      </p>
      <div
        className="mt-2 grid gap-1.5 @2xl:grid-cols-2"
        role="radiogroup"
        aria-labelledby="release-reason"
      >
        {RELEASE_REASONS.map((r) => (
          <label
            key={r}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-inset ${reason === r ? 'font-semibold text-ink ring-brand' : 'text-ink-2 ring-line'}`}
          >
            <input
              type="radio"
              name="release-reason"
              checked={reason === r}
              onChange={() => setReason(r)}
              className="accent-brand"
            />
            {r}
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          className="h-9 rounded-xl px-3.5 text-sm font-semibold text-ink-2 hover:bg-slate-100"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!reason}
          onClick={() => reason && update((c) => caseActions.decide(c, 'sent', now, reason))}
          className="h-9 rounded-xl bg-safe px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-40"
        >
          Release {money(f.hit.amount)}
        </button>
      </div>
    </div>
  )
}

/** The wire desk's buttons. Each one changes the shared case, and an ending can't be undone. */
export function TrickedActions({ f, now }: { f: TrickedFacts; now: Date }) {
  const { state, update } = useLindaCase()
  const [releasing, setReleasing] = useState(false)
  const done = state.outcome
  const ending = done && outcomeCopy(done)
  const did = (a: StaffAction) => state.staffActions.includes(a)
  const lookFor = (a: StaffAction, recommended = false): ActionLook =>
    did(a) ? 'done' : recommended ? 'recommended' : 'on'
  const holdUntil = clock(f.holdEnds)
  const act = (a: StaffAction) => update((c) => caseActions.staff(c, a))

  return (
    <Panel
      title="Actions"
      delay={0.05}
      aside={
        state.wantsToSend && !done ? (
          <StatusPill tone="brand" live>
            {f.name} wants to send
          </StatusPill>
        ) : undefined
      }
    >
      {ending && (
        <div
          className={`mb-3 flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm ring-1 ring-inset ${banner[ending.tone]}`}
        >
          <Lock size={16} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-semibold">{ending.status}. Final.</span>{' '}
            <span className="text-ink">{ending.staff}</span>
          </span>
        </div>
      )}
      {state.wantsToSend && !done && (
        <p className="mb-3 flex items-start gap-2.5 rounded-xl bg-brand-soft/70 px-3.5 py-2.5 text-sm text-ink">
          <MessageCircle size={16} className="mt-0.5 shrink-0 text-brand" />
          {f.name} still wants to send. Talk with her, then release it with a reason.
        </p>
      )}
      {releasing && !done ? (
        <ReleaseReason f={f} now={now} onBack={() => setReleasing(false)} />
      ) : (
        <div className="grid grid-cols-2 gap-2.5 pt-1 @3xl:grid-cols-4">
          <ActionButton
            look={done ? 'off' : state.wantsToSend ? 'recommended' : 'on'}
            accent="safe"
            icon={<Send size={18} />}
            label="Release"
            hint={done ? 'The ending is final' : 'Asks for a reason'}
            onClick={() => setReleasing(true)}
          />
          <ActionButton
            look={done && !did('holding') ? 'off' : lookFor('holding', !state.wantsToSend)}
            accent="warn"
            icon={<Hourglass size={18} />}
            label={`Keep holding (up to ${HOLD_HOURS}h)`}
            doneLabel={done ? 'Held' : `Holding until ${holdUntil}`}
            hint={`Up to ${plural(HOLD_HOURS, 'hour')} in total, until ${holdUntil}`}
            onClick={() => act('holding')}
          />
          <ActionButton
            look={lookFor('escalated')}
            accent="danger"
            icon={<ArrowUpRight size={18} />}
            label="Escalate"
            doneLabel="Escalated to a specialist"
            hint="To a fraud specialist"
            onClick={() => act('escalated')}
          />
          <ActionButton
            look={lookFor('case-opened')}
            accent="brand"
            icon={<FolderOpen size={18} />}
            label="Open a case"
            doneLabel="Case open"
            hint="Log the hold and what she shares"
            onClick={() => act('case-opened')}
          />
        </div>
      )}
      <p className="mt-3 text-xs text-ink-2">
        <span className="font-semibold text-ink">{f.name} decides:</span> Sound can delay and
        advise, not refuse.
      </p>
    </Panel>
  )
}
