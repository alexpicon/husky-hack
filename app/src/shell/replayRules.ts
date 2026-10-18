import { HEADS_UP_WINDOW_HOURS, recentCalls, tellerHeadsUp } from '../data/jamesRules'
import type { KitEvent } from '../data/kit'
import { FOLLOW_UP_WINDOW_DAYS, followUpTransfer, growingPattern, growingRun } from '../data/michaelRules'
import { POLICY } from '../data/policy'
import { CONTACT_WINDOW_DAYS, contactChanges, isStopChange, sessionEvents, takeoverTier } from '../data/takeoverRules'
import { sameDayRatio, TRICKED_RAIL_GAP_DAYS, TRICKED_RULES, trickedRule } from '../data/trickedRules'
import { clock, day, minutesBetween, money } from '../ui/format'
import type { Tone } from '../ui/primitives'

/** A member's events as a rule may read them; the replay passes only those up to the moment. */
export type History = (member: string) => KitEvent[]

export type RuleKey = 'stop' | 'check' | 'linda' | 'headsUp' | 'pattern' | 'followUp'

export type ReplayRule = {
  key: RuleKey
  /** The Design check's name for the rule. */
  label: string
  tone: Tone
  /** The rule at the current POLICY, reading only `history`. */
  fires: (history: History) => (e: KitEvent) => boolean
  /** The fact the rule used on this event, from the same history. */
  fact: (e: KitEvent, history: History) => string
}

const DAY_MS = 86_400_000

const plural = (n: number, word: string) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`

export const when = (d: Date) => `${day(d)}, ${clock(d)}`

/** The time from one event to a later one: to the minute under 3 days, to the hour after. */
export function span(from: Date, to: Date): string {
  const minutes = minutesBetween(from, to)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 72) return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`
  const days = plural(Math.floor(hours / 24), 'day')
  return hours % 24 ? `${days} ${hours % 24} h` : days
}

export function ordinal(n: number): string {
  const tens = n % 100
  const suffix = tens >= 11 && tens <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
  return `${n}${suffix}`
}

const added = (days: number | null) =>
  days === null ? 'with no age on record' : days === 0 ? 'added that day' : `added ${plural(days, 'day')} earlier`

const payment = (e: KitEvent) => `${e.rail} ${money(e.amount)}`

function must<T>(x: T | undefined, what: string, e: KitEvent): T {
  if (x === undefined) throw new Error(`${e.id}: no ${what} behind the rule`)
  return x
}

const tier = (h: History) => (e: KitEvent) => takeoverTier(e, { history: h, sessionRule: POLICY.sessionRule })

const article = (word: string) => (/^[aeiou]/.test(word) ? 'an' : 'a')

const changeList = (changes: KitEvent[]) =>
  changes.map((c) => `${article(c.type.toLowerCase())} ${c.type.toLowerCase()} at ${when(c.at)}`).join(' and ')

function stopFact(e: KitEvent, h: History): string {
  const changes = contactChanges(e, h).filter(isStopChange)
  if (e.passwordResetRecent && e.recipientStatus === 'New' && changes.length > 0) {
    return `${payment(e)}: reset flagged on the payment, a new recipient, and ${changeList(changes)} in the ${CONTACT_WINDOW_DAYS} days before, not confirmed on the old contact`
  }
  const last = must(sessionEvents(e, h).at(-1), 'reset, code or failed sign-in', e)
  return `${payment(e)} to a payee added that day, ${span(last.at, e.at)} after a ${last.type.toLowerCase()} at ${when(last.at)}`
}

function checkFact(e: KitEvent, h: History): string {
  return `${payment(e)}: reset flagged on the payment, a new recipient, and only ${changeList(contactChanges(e, h))} in the ${CONTACT_WINDOW_DAYS} days before`
}

function lindaFact(e: KitEvent, h: History): string {
  const rule = TRICKED_RULES[POLICY.lindaRule]
  const paid = `${payment(e)} to a payee ${added(e.recipientAgeDays)}`
  if (rule.sameDay) {
    const ratio = must(sameDayRatio(e, h) ?? undefined, 'baseline', e)
    return `${paid}; that day's wires to this payee reach ${ratio.toFixed(2)}x the member's 12-month 90th-percentile payment (line: ${rule.ratio}x)`
  }
  const gap = e.daysSinceLastSameRail
  const why = [
    e.recipientStatus === 'New' ? 'a new recipient' : '',
    gap === null ? `no earlier ${e.rail} on record` : '',
    gap !== null && gap >= TRICKED_RAIL_GAP_DAYS ? `${plural(gap, 'day')} since the last ${e.rail}` : '',
  ].filter(Boolean)
  return `${paid}, ${e.baselineRatio}x the member's 12-month 90th-percentile payment (line: ${rule.ratio}x); ${why.join(' and ')}`
}

function headsUpFact(e: KitEvent, h: History): string {
  const call = must(recentCalls(e, h).at(-1), 'contact center call', e)
  return `${payment(e)}, ${span(call.at, e.at)} after a contact center call at ${when(call.at)} (window: ${HEADS_UP_WINDOW_HOURS} h)`
}

function patternFact(e: KitEvent, h: History): string {
  const run = growingRun(e, h)
  return `${ordinal(run.length)} growing payment in a row to ${e.recipientId}, a payee ${added(e.recipientAgeDays)}: ${run.map((p) => money(p.amount)).join(', ')}`
}

function followUpFact(e: KitEvent, h: History): string {
  const card = growingPattern(h)
  const cards = h(e.member).filter(
    (c) =>
      c.at < e.at &&
      e.at.getTime() - c.at.getTime() < FOLLOW_UP_WINDOW_DAYS * DAY_MS &&
      c.recipientId !== e.recipientId &&
      card(c),
  )
  const last = must(cards.at(-1), 'pattern card', e)
  return `${payment(e)} to ${e.recipientId}, a different payee ${added(e.recipientAgeDays)}, ${span(last.at, e.at)} after the pattern card on ${last.recipientId} at ${when(last.at)}`
}

/** Every Second Look rule, named and ordered as the Design check shows them. */
export const REPLAY_RULES: ReplayRule[] = [
  { key: 'stop', label: 'Full stop', tone: 'danger', fires: (h) => (e) => tier(h)(e) === 'stop', fact: stopFact },
  { key: 'check', label: 'Light check', tone: 'warn', fires: (h) => (e) => tier(h)(e) === 'check', fact: checkFact },
  { key: 'linda', label: 'Linda’s rule', tone: 'brand', fires: (h) => trickedRule(POLICY.lindaRule, h), fact: lindaFact },
  { key: 'headsUp', label: 'James’s heads-up', tone: 'safe', fires: (h) => tellerHeadsUp(h), fact: headsUpFact },
  {
    key: 'pattern',
    label: 'Michael’s pattern card',
    tone: 'neutral',
    fires: (h) => growingPattern(h),
    fact: patternFact,
  },
  { key: 'followUp', label: 'Follow-up hold', tone: 'neutral', fires: (h) => followUpTransfer(h), fact: followUpFact },
]
