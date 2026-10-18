import { motion } from 'motion/react'
import { ArrowRight, Check, Info } from 'lucide-react'
import { useStory } from '../../story/engine'
import { LindaSkipper } from '../../skipper/boxes'
import { Tablet } from '../../ui/devices'
import { useLook } from '../../ui/look'
import { Button, Source } from '../../ui/primitives'
import { DrillReminder } from './drill/DrillReminder'
import { lindaFacts } from './facts'
import { caseActions, useLindaCase } from './lindaCase'
import { PausedStatus, TabletHeader } from './parts'
import { SilentCheckSound } from './SilentCheckSound'
import { CHECK_LAYOUT, type TapOption } from './taps'

function Toggle({ option, short = false }: { option: TapOption; short?: boolean }) {
  const { state, update } = useLindaCase()
  const on = state.taps.includes(option.id)
  const Icon = on ? Check : option.icon
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => update((c) => caseActions.tap(c, option.id))}
      className={`flex items-center gap-2.5 rounded-2xl px-3 text-left transition active:scale-[0.99] ${short ? 'h-12' : 'min-h-[52px] py-1.5'} ${on ? 'bg-brand text-white shadow-md ring-2 ring-brand' : 'bg-white text-ink ring-1 ring-slate-300 hover:ring-slate-400'}`}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full transition ${on ? 'bg-white text-brand' : 'bg-slate-100 text-ink-2'}`}
      >
        <Icon size={16} strokeWidth={on ? 3 : 2} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[15px] leading-tight font-semibold">{option.label}</span>
        {option.hint && (
          <span className={`text-xs leading-tight ${on ? 'text-white/80' : 'text-ink-3'}`}>
            {option.hint}
          </span>
        )}
      </span>
    </button>
  )
}

function SilentCheckConcept() {
  const f = lindaFacts()
  const { next } = useStory()
  const { update } = useLindaCase()
  const { answers, none, talk } = CHECK_LAYOUT
  const finish = () => {
    update(caseActions.finishCheck)
    next()
  }

  return (
    <Tablet caption="Branch tablet - Linda taps privately">
      <div className="flex min-h-full flex-col gap-3 px-6 py-5">
        <TabletHeader right={<PausedStatus />} />
        <DrillReminder sound={false} />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 rounded-2xl bg-warn-soft px-4 py-2.5 ring-1 ring-amber-200 ring-inset"
        >
          <Info size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <p className="text-[16px] leading-snug font-medium text-ink">
            This would be your <strong>first wire in {f.yearsSinceLastWire} years</strong>, to an
            account <strong>added {f.minutesSinceAdded} minutes ago</strong>.{' '}
            <Source ids={[f.wire.id, f.added.id]} />
          </p>
        </motion.div>

        <div>
          <h2 className="font-display text-[26px] leading-tight text-ink">
            Is any of this happening today?
          </h2>
          <p className="text-[15px] text-ink-2">
            Tap any that fit. You don't have to say it out loud.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2" role="group" aria-label="What is happening today">
          {answers.map((o) => (
            <Toggle key={o.id} option={o} />
          ))}
        </div>
        <LindaSkipper look="concept" />

        <div className="grid grid-cols-[1fr_1.45fr_auto] gap-2">
          <Toggle option={none} short />
          <Toggle option={talk} short />
          <Button size="lg" onClick={finish}>
            Continue <ArrowRight size={18} aria-hidden />
          </Button>
        </div>
      </div>
    </Tablet>
  )
}

export function SilentCheck() {
  return useLook() === 'sound' ? <SilentCheckSound /> : <SilentCheckConcept />
}
