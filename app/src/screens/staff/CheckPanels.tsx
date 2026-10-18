import { Check, EyeOff, HeartHandshake, MessageCircleHeart, ScanFace, UserRound } from 'lucide-react'
import { clock } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { Panel, StatusPill } from './parts'
import { useLindaCase } from '../linda/lindaCase'
import { nameScam } from '../linda/scams'
import { TAP_OPTIONS } from '../linda/taps'
import { grandparentScript } from './silentCheck'
import type { TrickedFacts } from './trickedFacts'
import type { TrickedStage } from './TrickedCase'

type CaseProps = { f: TrickedFacts; stage: TrickedStage; now: Date }

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Only the taps she chose to share. Skipping and not sharing look the same to staff. */
function useShared() {
  const { state } = useLindaCase()
  const taps = state.shared ? state.taps : []
  return { taps, named: nameScam(taps) }
}

export function SilentCheckPanel({ f, stage, now }: CaseProps) {
  const where = f.hit.channel === 'Branch' ? 'the branch tablet' : 'her phone'
  const finished = stage === 'checked'
  const { taps, named } = useShared()
  const spoken = f.spokenCheck && f.spokenCheck.at <= now ? f.spokenCheck : null
  const pill = !finished ? (
    <StatusPill tone="brand" live>
      In progress
    </StatusPill>
  ) : named ? (
    <StatusPill tone="danger">Taps fit the {named.scam.name}</StatusPill>
  ) : taps.length ? (
    <StatusPill tone="brand">Answers shared</StatusPill>
  ) : (
    <StatusPill tone="neutral">Answers private</StatusPill>
  )
  return (
    <Panel title="Silent check" icon={<ScanFace size={14} />} aside={pill}>
      {finished && taps.length > 0 ? (
        <>
          <p className="text-sm text-ink-2">
            {f.name} chose to share what she tapped on {where}:
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {TAP_OPTIONS.filter((o) => taps.includes(o.id)).map((o) => {
              const fits = named?.fitting.includes(o.id)
              return (
                <li
                  key={o.id}
                  className={`flex items-start gap-2.5 rounded-xl px-3 py-2 text-sm text-ink ${fits ? 'bg-danger-soft/70' : 'bg-slate-50'}`}
                >
                  <span
                    className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-white ${fits ? 'bg-rose-500' : 'bg-slate-400'}`}
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {o.label}
                </li>
              )
            })}
          </ul>
          <p className={`mt-2.5 text-xs font-semibold ${named ? 'text-danger' : 'text-ink-2'}`}>
            {named
              ? `${named.fitting.length} of her shared taps fit how the ${named.scam.name} works.`
              : "Her shared taps don't point to one scam."}
          </p>
        </>
      ) : (
        <div className="flex items-start gap-3 rounded-xl bg-brand-soft/60 px-3.5 py-3">
          <EyeOff size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <div className="text-sm font-semibold text-ink">
              {finished ? `Check finished on ${where}` : `Silent check in progress on ${where}`}
            </div>
            <div className="mt-0.5 text-xs leading-relaxed text-ink-2">
              {finished
                ? `${f.name}'s answers are private unless she shares them. A private check tells staff nothing either way.`
                : `${f.name} taps what is going on today, without saying it out loud. Staff see her answers only if she chooses to share them.`}
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
  const { taps, named } = useShared()
  const finished = stage === 'checked'
  return (
    <Panel
      title={finished && named ? `What to say · ${sentence(named.scam.name)}` : 'What to say'}
      icon={<MessageCircleHeart size={14} />}
      delay={0.05}
    >
      {finished && named ? (
        <ol className="space-y-2">
          {grandparentScript.map((line, i) => (
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
          {finished && taps.length > 0
            ? "Her shared answers don't name a scam. Offer the check everyone gets: call the person on a number she saved herself."
            : `If ${f.name} shares her answers, a short script for that scam type shows here.`}
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
