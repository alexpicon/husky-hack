import { eventsFor, type KitEvent } from './kit'
import { POLICY } from './policy'

export type LindaRule = typeof POLICY.lindaRule

/** Each variant's threshold, in multiples of the member's 12-month 90th-percentile payment. */
export const TRICKED_RULES: Record<LindaRule, { ratio: number; sameDay: boolean }> = {
  'per-wire-3x': { ratio: 3, sameDay: false },
  'same-day-2.5x': { ratio: 2.5, sameDay: true },
}

export const TRICKED_RATIO = TRICKED_RULES[POLICY.lindaRule].ratio
export const TRICKED_SAME_DAY = TRICKED_RULES[POLICY.lindaRule].sameDay
export const TRICKED_RAIL_GAP_DAYS = 180
/** The recipient must have been added less than this many days before the payment. */
export const TRICKED_RECIPIENT_MAX_AGE_DAYS = 1

type History = (member: string) => KitEvent[]

/** A blank age fails on purpose: in JavaScript `null < 1` is true. */
export const recipientAddedToday = (e: KitEvent) =>
  e.recipientAgeDays !== null && e.recipientAgeDays < TRICKED_RECIPIENT_MAX_AGE_DAYS

const freshWire = (e: KitEvent) =>
  e.type === 'Payment Initiated' && e.rail === 'Wire' && recipientAddedToday(e)

function perWire(e: KitEvent): boolean {
  if (e.type !== 'Payment Initiated' || !['Wire', 'Cash'].includes(e.rail)) return false
  if (!recipientAddedToday(e)) return false
  if (e.baselineRatio === null || e.baselineRatio < TRICKED_RULES['per-wire-3x'].ratio) return false
  const longGap =
    e.daysSinceLastSameRail === null || e.daysSinceLastSameRail >= TRICKED_RAIL_GAP_DAYS
  return e.recipientStatus === 'New' || longGap
}

/**
 * That day's wires to this payment's recipient, up to and including it, as a multiple of
 * the member's 12-month 90th-percentile payment. Null when the row has no baseline.
 */
export function sameDayRatio(e: KitEvent, history: History = eventsFor): number | null {
  if (!e.baselineRatio) return null
  const all = history(e.member)
  const at = all.indexOf(e)
  const sofar = at < 0 ? [...all.filter((p) => p.at <= e.at), e] : all.slice(0, at + 1)
  const day = e.at.toDateString()
  const total = sofar
    .filter((p) => freshWire(p) && p.recipientId === e.recipientId && p.at.toDateString() === day)
    .reduce((sum, p) => sum + p.amount, 0)
  return total / (e.amount / e.baselineRatio)
}

/** The ratio a variant compares with its threshold for this payment. */
export function trickedRatio(e: KitEvent, rule: LindaRule = POLICY.lindaRule): number | null {
  return TRICKED_RULES[rule].sameDay ? sameDayRatio(e) : e.baselineRatio
}

/** Linda's rule in either variant; tests swap `history` for a made-up day. */
export function trickedRule(rule: LindaRule, history: History = eventsFor) {
  if (!TRICKED_RULES[rule].sameDay) return perWire
  return (e: KitEvent) => {
    if (!freshWire(e)) return false
    const ratio = sameDayRatio(e, history)
    return ratio !== null && ratio >= TRICKED_RULES[rule].ratio
  }
}

/** The rule in effect, as POLICY.lindaRule sets it. */
export const isTricked = trickedRule(POLICY.lindaRule)
