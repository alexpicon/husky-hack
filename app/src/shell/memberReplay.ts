import { events, eventsFor, type KitEvent } from '../data/kit'
import { money } from '../ui/format'
import { REPLAY_RULES, type ReplayRule } from './replayRules'

/** Every member in the events file, in id order. */
export const members: string[] = [...new Set(events.map((e) => e.member))].sort()

/** Reads "m1039", "1039" or "M1039" as the kit's id; null when no such member is in the kit. */
export function findMember(input: string): string | null {
  const digits = input.replace(/\s+/g, '').toUpperCase().replace(/^M/, '')
  if (!/^\d+$/.test(digits)) return null
  const id = `M${digits}`
  return members.includes(id) ? id : null
}

/** The member `by` places away in the list, wrapping around at either end. */
export function stepMember(member: string, by: number): string {
  const n = members.length
  return members[(((members.indexOf(member) + by) % n) + n) % n]
}

/** Any member other than this one. */
export function randomMember(current: string, random: () => number = Math.random): string {
  const others = members.filter((m) => m !== current)
  return others[Math.floor(random() * others.length)]
}

/** One rule firing on one event, with the fact it used and how many events it could read. */
export type Hit = { rule: ReplayRule; event: KitEvent; fact: string; seen: number }

export type Replay = { member: string; events: KitEvent[]; hits: Hit[] }

const byTime = (a: KitEvent, b: KitEvent) => a.at.getTime() - b.at.getTime()

const cache = new Map<string, Replay>()

/**
 * Replays a member's events in time order. Each rule judges an event with a history cut at that
 * event's timestamp, so no rule can read anything stamped after the moment it fires.
 */
export function replay(member: string): Replay {
  const cached = cache.get(member)
  if (cached) return cached
  const all = [...eventsFor(member)].sort(byTime)
  const hits: Hit[] = []
  for (const event of all) {
    const sofar = all.filter((e) => e.at <= event.at)
    const history = (m: string) => (m === member ? sofar : [])
    for (const rule of REPLAY_RULES) {
      if (!rule.fires(history)(event)) continue
      hits.push({ rule, event, fact: rule.fact(event, history), seen: sofar.length })
    }
  }
  const result = { member, events: all, hits }
  cache.set(member, result)
  return result
}

const flag = (on: boolean, text: string) => (on ? text : '')

/** The CSV fields worth a glance on a timeline row, in reading order. */
export function details(e: KitEvent): string[] {
  const rail = e.rail === 'Not Applicable' ? '' : e.rail
  const age = e.recipientAgeDays === null ? '' : `, added ${e.recipientAgeDays} d before`
  return [
    e.amount > 0 ? `${rail} ${money(e.amount)}`.trim() : '',
    e.recipientId ? `to ${e.recipientId} (${e.recipientStatus.toLowerCase()}${age})` : '',
    e.amount > 0 && e.baselineRatio !== null ? `${e.baselineRatio}x baseline` : '',
    flag(e.passwordResetRecent, 'reset flagged'),
    flag(e.profileChangeRecent, 'profile change flagged'),
    e.memberResponse && e.memberResponse !== 'Not Asked' ? `answer: ${e.memberResponse}` : '',
  ].filter(Boolean)
}
