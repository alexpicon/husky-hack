import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { clock, money } from '../../ui/format'
import { Source, type Tone } from '../../ui/primitives'
import { sarah } from './facts'

function Side({
  tone,
  label,
  lost,
  children,
}: {
  tone: Extract<Tone, 'danger' | 'safe'>
  label: string
  lost: number
  children: ReactNode
}) {
  const danger = tone === 'danger'
  return (
    <div className={`rounded-2xl p-4 ${danger ? 'bg-danger-soft' : 'bg-safe-soft'}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`text-[13px] font-semibold ${danger ? 'text-danger' : 'text-safe'}`}>
          {label}
        </span>
        <span className="text-right">
          <span className="num text-[24px] leading-none font-semibold tracking-tight">
            {money(lost)}
          </span>
          <span className="ml-1 text-[12px] text-ink-3">lost</span>
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">{children}</ul>
    </div>
  )
}

function Line({ ok, children, ids }: { ok: boolean; children: ReactNode; ids: string | string[] }) {
  const Icon = ok ? Check : X
  return (
    <li className="flex gap-2 text-[13px] leading-snug text-ink-2">
      <Icon size={14} className={`mt-0.5 shrink-0 ${ok ? 'text-safe' : 'text-danger'}`} aria-hidden />
      <span>
        {children} <Source ids={ids} />
      </span>
    </li>
  )
}

/** Today's real outcome for Sarah from the kit, next to the same night with Second Look. */
export function Compare() {
  const { completed, reported, recoveryFailed, key, paused, second, daysToReport, recovered } = sarah
  return (
    <div className="w-[380px] rounded-3xl bg-white p-4 shadow-float ring-1 ring-line/70">
      <div className="px-1 pb-3 text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">
        Sarah's night, two ways
      </div>
      <div className="flex flex-col gap-2.5">
        <Side tone="danger" label="Today" lost={key.netLoss}>
          <Line ok={false} ids={completed.map((e) => e.id)}>
            Both payments sent, at {completed.map((e) => clock(e.at)).join(' and ')}
          </Line>
          <Line ok={false} ids={reported.id}>
            Found {daysToReport} days later
          </Line>
          <Line ok={false} ids={recoveryFailed.map((e) => e.id)}>
            {recovered > 0 ? `Only ${money(recovered)} recovered` : 'Nothing recovered'}
          </Line>
        </Side>
        <Side tone="safe" label="With Second Look" lost={0}>
          <Line ok ids={paused.id}>
            First payment paused at {clock(paused.at)}, before it's sent
          </Line>
          <Line ok ids={second.id}>
            The {money(second.amount)} payment at {clock(second.at)} never happens: account locked
          </Line>
        </Side>
      </div>
    </div>
  )
}
