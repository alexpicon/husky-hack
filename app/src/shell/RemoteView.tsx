import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import type { Scenario } from '../story/engine'
import { LookToggle } from '../ui/look'
import { toneDot } from '../ui/primitives'
import type { Tab } from './Header'
import { SessionControl } from './SessionControl'

type Props = {
  tabs: Tab[]
  active: string
  scenario?: Scenario
  index: number
  onSelect: (id: string) => void
  onPrev: () => void
  onNext: () => void
  onGo: (i: number) => void
}

/** Phone remote: drives every laptop in the session. Shows the presenter's script. */
export function RemoteView({ tabs, active, scenario, index, onSelect, onPrev, onNext, onGo }: Props) {
  const step = scenario?.steps[index]
  const last = scenario ? index === scenario.steps.length - 1 : true
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="font-display text-2xl">Second Look remote</div>
        <SessionControl />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left ring-1 transition ${t.id === active ? 'bg-ink text-white ring-ink' : 'bg-white ring-line'}`}
          >
            <span className={`size-2.5 shrink-0 rounded-full ${toneDot[t.tone]}`} />
            <span className="text-[15px] font-semibold">{t.label}</span>
          </button>
        ))}
      </div>

      <LookToggle />

      {step && scenario ? (
        <div className="flex flex-1 flex-col rounded-3xl bg-white p-5 shadow-float ring-1 ring-line">
          <div className="flex items-center justify-between text-xs text-ink-3">
            <span className="num font-mono">
              {index + 1} / {scenario.steps.length}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {step.clock}
            </span>
          </div>
          <h1 className="mt-3 font-display text-[30px] leading-tight">{step.title}</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{step.caption}</p>
          <div className="mt-auto flex justify-center gap-2 pt-5">
            {scenario.steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Step ${i + 1}: ${s.title}`}
                onClick={() => onGo(i)}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-9 bg-ink' : 'w-5 bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 rounded-3xl bg-white p-5 text-ink-2 ring-1 ring-line">
          Design check and pilot are on screen. Pick a story to continue.
        </div>
      )}

      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!step || index === 0}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-white text-lg font-semibold ring-1 ring-line disabled:opacity-40"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!step || last}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-ink text-lg font-semibold text-white disabled:opacity-40"
        >
          Next <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}
