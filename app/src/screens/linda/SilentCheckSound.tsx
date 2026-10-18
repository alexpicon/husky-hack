import { motion } from 'motion/react'
import { ArrowRight, Check, Info } from 'lucide-react'
import { LindaSkipper } from '../../skipper/boxes'
import { useStory } from '../../story/engine'
import { Source } from '../../ui/primitives'
import { SOUND, SoundButton, SoundCard } from '../../ui/soundApp'
import { DrillReminder } from './drill/DrillReminder'
import { lindaFacts } from './facts'
import { NavyIcon, SoundKiosk } from './kiosk'
import { caseActions, useLindaCase } from './lindaCase'
import { CHECK_LAYOUT, type TapOption } from './taps'

function Option({ option, short = false }: { option: TapOption; short?: boolean }) {
  const { state, update } = useLindaCase()
  const on = state.taps.includes(option.id)
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => update((c) => caseActions.tap(c, option.id))}
      className={`flex items-center gap-2.5 rounded-[16px] border-2 px-3 text-left shadow-[0_2px_10px_rgb(15_23_42/0.07)] transition active:scale-[0.99] ${short ? 'h-12' : 'min-h-[52px] py-1.5'}`}
      style={{ borderColor: on ? SOUND.link : 'transparent', background: on ? '#eaf2fc' : '#fff' }}
    >
      {on ? (
        <span
          className="grid size-6 shrink-0 place-items-center rounded-full text-white"
          style={{ background: SOUND.link }}
        >
          <Check size={15} strokeWidth={3} aria-hidden />
        </span>
      ) : (
        <NavyIcon icon={option.icon} size={24} />
      )}
      <span className="flex min-w-0 flex-col">
        <span className="text-[15px] leading-tight font-semibold">{option.label}</span>
        {option.hint && (
          <span className="text-[12px] leading-tight" style={{ color: SOUND.muted }}>
            {option.hint}
          </span>
        )}
      </span>
    </button>
  )
}

export function SilentCheckSound() {
  const f = lindaFacts()
  const { next } = useStory()
  const { update } = useLindaCase()
  const { answers, none, talk } = CHECK_LAYOUT
  const finish = () => {
    update(caseActions.finishCheck)
    next()
  }

  return (
    <SoundKiosk caption="Branch tablet - Linda taps privately">
      <DrillReminder sound />
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <SoundCard className="flex items-start gap-3 py-2.5">
          <NavyIcon icon={Info} size={24} />
          <p className="text-[16px] leading-snug">
            This would be your <strong>first wire in {f.yearsSinceLastWire} years</strong>, to an
            account <strong>added {f.minutesSinceAdded} minutes ago</strong>.{' '}
            <Source ids={[f.wire.id, f.added.id]} />
          </p>
        </SoundCard>
      </motion.div>

      <div>
        <h2 className="text-[20px] leading-tight font-bold" style={{ color: SOUND.navy }}>
          Is any of this happening today?
        </h2>
        <p className="text-[15px]" style={{ color: SOUND.muted }}>
          Tap any that fit. You don't have to say it out loud.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2" role="group" aria-label="What is happening today">
        {answers.map((o) => (
          <Option key={o.id} option={o} />
        ))}
      </div>
      <LindaSkipper look="sound" />

      <div className="grid grid-cols-[1fr_1.45fr_150px] gap-2">
        <Option option={none} short />
        <Option option={talk} short />
        <SoundButton onClick={finish}>
          Continue <ArrowRight size={18} aria-hidden />
        </SoundButton>
      </div>
    </SoundKiosk>
  )
}
