import { motion } from 'motion/react'
import { ArrowRight, Check, Info, PauseCircle } from 'lucide-react'
import { useStory } from '../../story/engine'
import { Tablet } from '../../ui/devices'
import { Button, Source } from '../../ui/primitives'
import { dollars, lindaFacts } from './facts'
import { TabletHeader } from './parts'
import { TAP_OPTIONS, toggleTap, useTaps, type TapOption } from './taps'

function Toggle({ option, on, wide = false }: { option: TapOption; on: boolean; wide?: boolean }) {
  const Icon = on ? Check : option.icon
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggleTap(option.id)}
      className={`flex items-center gap-3 rounded-2xl px-3.5 text-left transition active:scale-[0.99] ${wide ? 'h-12 flex-1' : 'min-h-[66px] py-2.5'} ${on ? 'bg-brand text-white shadow-md ring-2 ring-brand' : 'bg-white text-ink ring-1 ring-slate-300 hover:ring-slate-400'}`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full transition ${on ? 'bg-white text-brand' : 'bg-slate-100 text-ink-2'}`}
      >
        <Icon size={18} strokeWidth={on ? 3 : 2} aria-hidden />
      </span>
      <span className="text-base leading-snug font-semibold">{option.label}</span>
    </button>
  )
}

export function SilentCheck() {
  const f = lindaFacts()
  const { next } = useStory()
  const taps = useTaps()
  const [other] = TAP_OPTIONS.filter((o) => !o.scamSignal)
  const signals = TAP_OPTIONS.filter((o) => o.scamSignal)

  return (
    <Tablet caption="Branch tablet - Linda taps privately">
      <div className="flex min-h-full flex-col gap-3.5 p-6">
        <TabletHeader
          right={
            <>
              <PauseCircle size={16} className="text-warn" aria-hidden />
              Your wire is paused · <span className="num font-mono">{dollars(f.wire.amount)}</span>
            </>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 rounded-2xl bg-warn-soft px-4 py-3 ring-1 ring-amber-200 ring-inset"
        >
          <Info size={20} className="mt-1 shrink-0 text-warn" aria-hidden />
          <p className="text-[18px] leading-snug font-medium text-ink">
            This would be your <strong>first wire in {f.yearsSinceLastWire} years</strong>, to an
            account <strong>added {f.minutesSinceAdded} minutes ago</strong>.{' '}
            <Source ids={[f.wire.id, f.added.id]} />
          </p>
        </motion.div>

        <div>
          <h2 className="font-display text-[28px] leading-tight text-ink">
            Is any of this happening today?
          </h2>
          <p className="text-base text-ink-2">
            Tap any that fit. You don't have to say it out loud.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="What is happening today">
          {signals.map((o) => (
            <Toggle key={o.id} option={o} on={taps.includes(o.id)} />
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Toggle option={other} on={taps.includes(other.id)} wide />
          <Button size="lg" onClick={next}>
            Continue <ArrowRight size={18} aria-hidden />
          </Button>
        </div>
      </div>
    </Tablet>
  )
}
