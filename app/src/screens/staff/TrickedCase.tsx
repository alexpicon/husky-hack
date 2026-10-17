import { StaffWindow } from '../../ui/devices'

/** held: wire on hold, silent check in progress. checked: member shared what she tapped. */
export type TrickedStage = 'held' | 'checked'

export function TrickedCase({ member, stage }: { member: 'M1001'; stage: TrickedStage }) {
  return (
    <StaffWindow title="Wire desk">
      {member} · {stage}
    </StaffWindow>
  )
}
