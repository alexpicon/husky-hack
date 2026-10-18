import { isTellerHeadsUp, recentCalls, unaskedBranchCash } from '../../data/jamesRules'
import { eventsFor, type KitEvent } from '../../data/kit'
import { firstHit } from '../../data/triggers'
import { day } from '../../ui/format'

export const JAMES = 'M1004'
/** Named in the starter kit, which lists M1001 to M1004 as Linda, Michael, Sarah and James. */
export const JAMES_NAME = 'James'

function find(label: string, list: KitEvent[], match: (e: KitEvent) => boolean): KitEvent {
  const hit = list.find(match)
  if (!hit) throw new Error(`James (${JAMES}): expected event "${label}" is missing from the kit`)
  return hit
}

const DAY_MS = 86_400_000
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** "yesterday" when `then` is the day before `now`, otherwise its date. */
export function daysAgo(then: Date, now: Date): string {
  const gap = Math.round((midnight(now) - midnight(then)) / DAY_MS)
  return gap === 0 ? 'today' : gap === 1 ? 'yesterday' : `on ${day(then)}`
}

/**
 * What James asked the contact center, from the call's note with its "Member asked" lead-in
 * dropped. In production this would be the call's reason code.
 */
export const callTopic = (note: string) => note.replace(/^member asked\s+/i, '')

function build() {
  const all = eventsFor(JAMES)
  const cash = firstHit(JAMES, isTellerHeadsUp)
  if (!cash) throw new Error(`James (${JAMES}): the teller heads-up did not fire`)
  if (cash.baselineRatio === null) throw new Error(`James (${JAMES}): ${cash.id} has no baseline`)
  const call = recentCalls(cash).at(-1)!
  const onCash = (type: string) => (e: KitEvent) => e.type === type && e.paymentId === cash.paymentId
  const after = all.filter((e) => e.at >= cash.at)
  const sameDay = (e: KitEvent) => e.at.toDateString() === cash.at.toDateString()
  const cancelled = find('Payment Cancelled', after, onCash('Payment Cancelled'))
  return {
    call,
    topic: callTopic(call.note),
    visit: find('Branch Visit', all, (e) => e.type === 'Branch Visit' && sameDay(e) && e.at <= cash.at),
    cash,
    ratio: cash.baselineRatio,
    confirm: find('Confirmation Requested', after, onCash('Confirmation Requested')),
    escalated: find('Employee Escalation', after, onCash('Employee Escalation')),
    offered: find('Trusted Contact Offered', after, (e) => e.type === 'Trusted Contact Offered'),
    enrolled: find('Trusted Contact Enrolled', after, (e) => e.type === 'Trusted Contact Enrolled'),
    cancelled,
    opened: find('Case Created', after, (e) => e.type === 'Case Created' && e.at >= cancelled.at),
    caseId: `CASE-${JAMES}-${cash.paymentId}`,
    unasked: unaskedBranchCash(),
  }
}

export type JamesFacts = ReturnType<typeof build>

let cached: JamesFacts | null = null

/** James's day from the kit's events, built once. */
export function jamesFacts(): JamesFacts {
  cached ??= build()
  return cached
}
