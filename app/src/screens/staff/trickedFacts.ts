import eventsCsv from '@kit/HuskyHack_Synthetic_Events_v2.csv?raw'
import { parseCsv, type Row } from '../../data/csv'
import { eventsFor, type KitEvent } from '../../data/kit'
import { firstHit, isTricked } from '../../data/triggers'
import {
  TRICKED_RECIPIENT_MAX_AGE_DAYS,
  TRICKED_RULES,
  trickedRatio,
  type LindaRule,
} from '../../data/trickedRules'
import { POLICY } from '../../data/policy'
import { minutesBetween } from '../../ui/format'
import { HOLD_HOURS, LINDA, LINDA_NAME } from '../linda/facts'
import { need, plural } from './helpers'

export { HOLD_HOURS }

/** Reads one full kit row, for columns the shared loader does not map. */
function rawEvent(id: string): Row {
  const header = eventsCsv.slice(0, eventsCsv.indexOf('\n'))
  const start = eventsCsv.indexOf(`\n${id},`)
  if (start < 0) throw new Error(`Staff console: kit row ${id} not found`)
  const end = eventsCsv.indexOf('\n', start + 1)
  const line = eventsCsv.slice(start + 1, end < 0 ? undefined : end)
  return need(parseCsv(`${header}\n${line}\n`)[0], `parsed kit row ${id}`)
}

export type TrickedFacts = {
  member: string
  name: string
  caseId: string
  hit: KitEvent
  recipientAdded: KitEvent
  minutesSinceAdded: number
  daysSinceSameRail: number
  yearsSinceSameRail: number
  ratio: string
  holdEnds: Date
  trustedOnFile: boolean
  spokenCheck?: KitEvent
}

export function trickedFacts(member: string): TrickedFacts {
  const all = eventsFor(member)
  const hit = need(firstHit(member, isTricked), `${member} payment matching the tricked trigger`)
  const prior = all.slice(0, all.indexOf(hit))
  const recipientAdded = need(
    prior.findLast((e) => e.type === 'Recipient Added' && e.recipientId === hit.recipientId),
    `${member} Recipient Added for ${hit.recipientId}`,
  )
  const days = need(hit.daysSinceLastSameRail, `${hit.id} days_since_last_same_rail`)
  const ratio = need(trickedRatio(hit), `${hit.id} amount_to_baseline_ratio`)
  return {
    member,
    name: member === LINDA ? LINDA_NAME : `Member ${member}`,
    caseId: `CASE-${member}-${hit.paymentId}`,
    hit,
    recipientAdded,
    minutesSinceAdded: minutesBetween(recipientAdded.at, hit.at),
    daysSinceSameRail: days,
    yearsSinceSameRail: Math.floor(days / 365.25),
    ratio: ratio.toFixed(1),
    holdEnds: new Date(hit.at.getTime() + HOLD_HOURS * 3_600_000),
    trustedOnFile: rawEvent(hit.id).trusted_contact_enrolled === 'Yes',
    spokenCheck: all.find(
      (e) => e.type === 'Confirmation Requested' && e.paymentId === hit.paymentId,
    ),
  }
}

/** The wire desk's one-line statement of Linda's rule, in either variant. */
export function wireRuleText(rule: LindaRule = POLICY.lindaRule) {
  const { ratio, sameDay } = TRICKED_RULES[rule]
  const recent = `a recipient added less than ${plural(TRICKED_RECIPIENT_MAX_AGE_DAYS, 'day')} ago`
  const baseline = "the member's 12-month 90th-percentile payment"
  return sameDay
    ? `a day's wires to ${recent}, together at least ${ratio}x ${baseline}.`
    : `a wire at least ${ratio}x ${baseline}, to ${recent}.`
}
