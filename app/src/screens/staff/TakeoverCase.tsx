import { StaffWindow } from '../../ui/devices'

/**
 * Stage of a takeover case as the story moves:
 * watching -> paused -> asked -> (not-me -> secured) | (its-me -> released)
 */
export type TakeoverStage =
  | 'watching'
  | 'paused'
  | 'asked'
  | 'not-me'
  | 'secured'
  | 'its-me'
  | 'released'

export function TakeoverCase({ member, stage }: { member: 'M1003' | 'M1039'; stage: TakeoverStage }) {
  return (
    <StaffWindow title="Case queue">
      {member} · {stage}
    </StaffWindow>
  )
}
