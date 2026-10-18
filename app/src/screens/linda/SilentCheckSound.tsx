import { motion } from 'motion/react'
import { ArrowRight, Check, Info } from 'lucide-react'
import { useStory } from '../../story/engine'
import { Source } from '../../ui/primitives'
import { SOUND, SoundButton, SoundCard } from '../../ui/soundApp'
import { lindaFacts } from './facts'
import { NavyIcon, SoundKiosk } from './kiosk'
import { caseActions, useLindaCase } from './lindaCase'
import { TAP_OPTIONS, type TapOption } from './taps'

function Option({ option, on, wide = false }: { option: TapOption; on: boolean; wide?: boolean }) {
  const { update } = useLindaCase()
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => update((c) => caseActions.tap(c, option.id))}
      className={`flex items-center gap-3 rounded-[18px] border-2 px-3.5 text-left shadow-[0_2px_10px_rgb(15_23_42/0.07)] transition active:scale-[0.99] ${wide ? 'h-12 flex-1' : 'min-h-[64px] py-2'}`}
      style={{ borderColor: on ? SOUND.link : 'transparent', background: on ? '#eaf2fc' : '#fff' }}
    >
      {on ? (
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full text-white"
          style={{ background: SOUND.link }}
        >
          <Check size={17} strokeWidth={3} aria-hidden />
        </span>
      ) : (
        <NavyIcon icon={option.icon} />
      )}
      <span className="text-[16px] leading-snug font-semibold">{option.label}</span>
    </button>
  )
}

export function SilentCheckSound() {
  const f = lindaFacts()
  const { next } = useStory()
  const { state, update } = useLindaCase()
  const taps = state.taps
  const finish = () => {
    update(caseActions.finishCheck)
    next()
  }
  const [other] = TAP_OPTIONS.filter((o) => !o.scamSignal)
  const signals = TAP_OPTIONS.filter((o) => o.scamSignal)

  return (
    <SoundKiosk caption="Branch tablet - Linda taps privately">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <SoundCard className="flex items-start gap-3 py-3">
          <NavyIcon icon={Info} />
          <p className="text-[17px] leading-snug">
            This would be your <strong>first wire in {f.yearsSinceLastWire} years</strong>, to an
            account <strong>added {f.minutesSinceAdded} minutes ago</strong>.{' '}
            <Source ids={[f.wire.id, f.added.id]} />
          </p>
        </SoundCard>
      </motion.div>

      <div>
        <h2 className="text-[22px] leading-tight font-bold" style={{ color: SOUND.navy }}>
          Is any of this happening today?
        </h2>
        <p className="mt-0.5 text-[16px]" style={{ color: SOUND.muted }}>
          Tap any that fit. You don't have to say it out loud.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="What is happening today">
        {signals.map((o) => (
          <Option key={o.id} option={o} on={taps.includes(o.id)} />
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <Option option={other} on={taps.includes(other.id)} wide />
        <div className="w-[176px] shrink-0">
          <SoundButton onClick={finish}>
            Continue <ArrowRight size={18} aria-hidden />
          </SoundButton>
        </div>
      </div>
    </SoundKiosk>
  )
}
