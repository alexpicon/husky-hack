import { eventsFor, memberKeys, type KitEvent, type MemberKey } from './kit'

export const TRICKED_RATIO = 3
export const TRICKED_RAIL_GAP_DAYS = 180

export type TakeoverSignals = {
  passwordReset: boolean
  contactChange: boolean
  newRecipient: boolean
}

export function takeoverSignals(e: KitEvent): TakeoverSignals {
  return {
    passwordReset: e.passwordResetRecent,
    contactChange: e.profileChangeRecent,
    newRecipient: e.recipientStatus === 'New',
  }
}

const isOutgoingStart = (e: KitEvent) => e.type === 'Payment Initiated'

export function isTakeover(e: KitEvent): boolean {
  const s = takeoverSignals(e)
  return isOutgoingStart(e) && s.passwordReset && s.contactChange && s.newRecipient
}

export function isTricked(e: KitEvent): boolean {
  if (!isOutgoingStart(e) || !['Wire', 'Cash'].includes(e.rail)) return false
  if (e.baselineRatio === null || e.baselineRatio < TRICKED_RATIO) return false
  const longGap =
    e.daysSinceLastSameRail === null || e.daysSinceLastSameRail >= TRICKED_RAIL_GAP_DAYS
  return e.recipientStatus === 'New' || longGap
}

export function firstHit(member: string, trigger: (e: KitEvent) => boolean) {
  return eventsFor(member).find(trigger)
}

export type Group = 'Routine' | 'Look-alike' | string

export function groupOf(k: MemberKey): Group {
  if (k.lookalike) return 'Look-alike'
  return k.scenario === 'Normal Activity' ? 'Routine' : k.scenario
}

export type GroupResult = { group: Group; flagged: number; total: number }

export function evaluate(trigger: (e: KitEvent) => boolean): GroupResult[] {
  const results = new Map<Group, GroupResult>()
  for (const k of memberKeys) {
    const group = groupOf(k)
    const r = results.get(group) ?? { group, flagged: 0, total: 0 }
    r.total++
    if (firstHit(k.member, trigger)) r.flagged++
    results.set(group, r)
  }
  return [...results.values()]
}
