import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { Step, Zone, Zones } from '../story/engine'
import { Eyebrow } from '../ui/primitives'
import { Fit } from './Fit'
import { ZoneFrame } from './Zone'

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

/** A step that relabels the member pane (say, a card from the kit) keeps the zone's color. */
const memberZone = (step: Step, zones: Zones): Zone =>
  step.memberLabel ? { tone: 'member', label: step.memberLabel } : zones.member

/** The attacker's device, when the step has one and the story labels it. */
function attackerZone(step: Step, zones: Zones) {
  return step.attacker !== undefined && zones.attacker ? zones.attacker : null
}

type StageProps = { id: string; step: Step; zones: Zones }

export function BothStage({ id, step, zones }: StageProps) {
  const attacker = attackerZone(step, zones)
  const columns = attacker
    ? 'xl:grid-cols-[auto_auto_minmax(0,1fr)]'
    : 'xl:grid-cols-[auto_minmax(0,1fr)]'
  return (
    <Enter id={id} className={`stage-fit mt-6 grid items-start gap-7 ${columns}`}>
      {attacker && <ZoneFrame zone={attacker}>{step.attacker}</ZoneFrame>}
      <ZoneFrame zone={memberZone(step, zones)}>{step.member}</ZoneFrame>
      <ZoneFrame zone={zones.staff}>{step.staff}</ZoneFrame>
    </Enter>
  )
}

/** Member screens alone: narration on the left, the devices as large as the laptop allows. */
export function MemberStage({ id, step, zones, narrator }: StageProps & { narrator: ReactNode }) {
  const attacker = attackerZone(step, zones)
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(300px,380px)_1fr]">
      <div className="lg:sticky lg:top-28">{narrator}</div>
      <Enter id={id}>
        <Fit maxScale={1.5} bottom={24}>
          <div className="flex items-start gap-6">
            {attacker && <ZoneFrame zone={attacker}>{step.attacker}</ZoneFrame>}
            <ZoneFrame zone={memberZone(step, zones)}>{step.member}</ZoneFrame>
          </div>
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
