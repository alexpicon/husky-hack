import type { KitEvent } from './kit'

export const TRICKED_RATIO = 3
export const TRICKED_RAIL_GAP_DAYS = 180

export function isTricked(e: KitEvent): boolean {
  if (e.type !== 'Payment Initiated' || !['Wire', 'Cash'].includes(e.rail)) return false
  if (e.baselineRatio === null || e.baselineRatio < TRICKED_RATIO) return false
  const longGap =
    e.daysSinceLastSameRail === null || e.daysSinceLastSameRail >= TRICKED_RAIL_GAP_DAYS
  return e.recipientStatus === 'New' || longGap
}
