import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { Step } from '../story/engine'
import { Eyebrow } from '../ui/primitives'
import { Fit } from './Fit'

/** Natural width of the staff console before it is scaled to the screen. */
const STAFF_WIDTH = 1080

function Enter({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return (
    <motion.section
      key={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

const memberLabel = (step: Step) => step.memberLabel ?? 'What the member sees'

export function BothStage({ id, step }: { id: string; step: Step }) {
  return (
    <Enter id={id} className="stage-fit mt-6 grid items-start gap-10 xl:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-3">
        <Eyebrow>{memberLabel(step)}</Eyebrow>
        {step.member}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <Eyebrow>What Sound staff see</Eyebrow>
        {step.staff}
      </div>
    </Enter>
  )
}

/** Member screen alone: narration on the left, the device as large as the laptop allows. */
export function MemberStage({ id, step, narrator }: { id: string; step: Step; narrator: ReactNode }) {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(300px,380px)_1fr]">
      <div className="lg:sticky lg:top-28">{narrator}</div>
      <Enter id={id} className="flex flex-col items-center gap-3">
        <Eyebrow>{memberLabel(step)}</Eyebrow>
        <Fit maxScale={1.5} bottom={24}>
          {step.member}
        </Fit>
      </Enter>
    </div>
  )
}

/** Staff console alone, scaled up to the full width of the laptop. */
export function StaffStage({ id, step }: { id: string; step: Step }) {
  return (
    <Enter id={id} className="mt-6 flex flex-col gap-3">
      <Eyebrow>What Sound staff see</Eyebrow>
      <Fit mode="width" maxScale={1.45} align="start">
        <div style={{ width: STAFF_WIDTH }}>{step.staff}</div>
      </Fit>
    </Enter>
  )
}
