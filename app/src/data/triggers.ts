import { eventsFor, memberKeys, type KitEvent, type MemberKey } from './kit'

export { isTakeover, takeoverSignals, type TakeoverSignals } from './takeoverRules'
export { isTricked, TRICKED_RAIL_GAP_DAYS, TRICKED_RATIO } from './trickedRules'

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
