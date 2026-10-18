import { Check, EyeOff, HeartHandshake, MessageCircleHeart, ScanFace, UserRound } from 'lucide-react'
import { clock } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { Panel, StatusPill } from './parts'
import { grandparentScam, silentTaps } from './silentCheck'
import type { TrickedFacts } from './trickedFacts'
import type { TrickedStage } from './TrickedCase'

type CaseProps = { f: TrickedFacts; stage: TrickedStage; now: Date }

export function SilentCheckPanel({ f, stage, now }: CaseProps) {
  const where = f.hit.channel === 'Branch' ? 'the branch tablet' : 'her phone'
  const shared = stage === 'checked'
  const spoken = f.spokenCheck && f.spokenCheck.at <= now ? f.spokenCheck : null
  return (
    <Panel
      title="Silent check"
      icon={<ScanFace size={14} />}
      aside={
        shared ? (
          <StatusPill tone="danger">Matches {grandparentScam.name.toLowerCase()}</StatusPill>
        ) : (
          <StatusPill tone="brand" live>
            In progress
          </StatusPill>
        )
      }
    >
      {shared ? (
        <>
          <p className="text-sm text-ink-2">
            {f.name} chose to share what she tapped on {where}:
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {silentTaps.map((t) => (
              <li key={t} className="flex items-start gap-2.5 rounded-xl bg-danger-soft/70 px-3 py-2 text-sm text-ink">
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-rose-500 text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-xs font-semibold text-danger">
            {silentTaps.length} of {silentTaps.length} match how the {grandparentScam.name.toLowerCase()} works.
          </p>
        </>
      ) : (
        <div className="flex items-start gap-3 rounded-xl bg-brand-soft/60 px-3.5 py-3">
          <EyeOff size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <div className="text-sm font-semibold text-ink">Silent check in progress on {where}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-ink-2">
              {f.name} taps what is going on today, without saying it out loud. Staff see her
              answers only if she chooses to share them.
            </div>
          </div>
        </div>
      )}
      {spoken?.note && (
        <p className="mt-3 border-t border-line/70 pt-2.5 text-xs leading-relaxed text-ink-3">
          <span className="font-semibold text-ink-2">Why silent:</span> in the kit, the spoken
          check at {clock(spoken.at)} failed. Note on file: "{spoken.note}"{' '}
          <Source ids={spoken.id} />
        </p>
      )}
    </Panel>
  )
}

export function ScriptPanel({ f, stage }: { f: TrickedFacts; stage: TrickedStage }) {
  return (
    <Panel
      title={stage === 'checked' ? `What to say · ${grandparentScam.name}` : 'What to say'}
      icon={<MessageCircleHeart size={14} />}
      delay={0.05}
    >
      {stage === 'checked' ? (
        <ol className="space-y-2">
          {grandparentScam.script.map((line, i) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink">
              <span className="num mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-safe-soft font-mono text-[11px] font-semibold text-safe">
                {i + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-ink-3">
          If {f.name} shares her answers, a short script for that scam type shows here.
        </p>
      )}
    </Panel>
  )
}

export function TrustedPanel({ f }: { f: TrickedFacts }) {
  return (
    <Panel title="Trusted person" icon={<HeartHandshake size={14} />} delay={0.1}>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-ink-3">
          <UserRound size={18} />
        </span>
        <div className="min-w-0 text-sm">
          <div className="font-semibold text-ink">
            {f.trustedOnFile ? 'On file' : 'None on file'} <Source ids={f.hit.id} />
          </div>
          <div className="mt-0.5 text-xs leading-relaxed text-ink-3">
            {f.trustedOnFile
              ? `One tap asks them to call ${f.name}. They never see amounts or the account.`
              : 'Offer to add one after this case closes: informed only, never sees amounts ' +
                'or the account.'}
          </div>
        </div>
      </div>
    </Panel>
  )
}
