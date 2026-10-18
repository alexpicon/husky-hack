import { Headphones } from 'lucide-react'
import { SOUND } from '../../../ui/soundApp'
import { REMINDER } from './copy'
import { useDrill } from './drillState'
import { DrillSync } from './drillStore'

/** What her held wire leads with, once she has done the drill on a calm day. */
export function DrillReminder({ sound }: { sound: boolean }) {
  const { completed } = useDrill()
  return (
    <>
      <DrillSync />
      {completed && (
        <p
          className={`flex items-start gap-2.5 rounded-2xl px-4 py-2 text-[15px] leading-snug font-semibold ${sound ? 'bg-white shadow-[0_2px_10px_rgb(15_23_42/0.07)]' : 'bg-brand-soft text-ink ring-1 ring-indigo-200 ring-inset'}`}
          style={sound ? { color: SOUND.navy } : undefined}
        >
          <Headphones size={18} className={`mt-0.5 shrink-0 ${sound ? '' : 'text-brand'}`} aria-hidden />
          {REMINDER}
        </p>
      )}
    </>
  )
}
