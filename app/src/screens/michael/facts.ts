import { eventsFor, type KitEvent } from '../../data/kit'
import { CALLS_END_HOUR, growingRun, isFollowUpTransfer, isGrowingPattern } from '../../data/michaelRules'
import { evaluate, firstHit } from '../../data/triggers'
import { clock, minutesBetween, money } from '../../ui/format'
import { HOLD_HOURS, plusMinutes, shortDate } from '../linda/facts'

export const MICHAEL = 'M1002'
/** Named in the starter kit, which lists M1001 to M1004 as Linda, Michael, Sarah and James. */
export const MICHAEL_NAME = 'Michael'

const DAY_MS = 86_400_000

function find(label: string, list: KitEvent[], match: (e: KitEvent) => boolean): KitEvent {
  const hit = list.find(match)
  if (!hit) throw new Error(`Michael (${MICHAEL}): expected event "${label}" is missing from the kit`)
  return hit
}

const cents = (n: number) => Math.round(n * 100) / 100
const total = (list: KitEvent[]) => cents(list.reduce((sum, e) => sum + e.amount, 0))
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const calendarDays = (a: Date, b: Date) => Math.round((midnight(b) - midnight(a)) / DAY_MS)
const atHour = (d: Date, hour: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour)

/** Up to HOLD_HOURS, and never past the hour calls end that day. */
export function holdEndsFor(at: Date): Date {
  const cap = plusMinutes(at, HOLD_HOURS * 60)
  const callsEnd = atHour(at, CALLS_END_HOUR)
  return callsEnd > at && callsEnd < cap ? callsEnd : cap
}

function build() {
  const all = eventsFor(MICHAEL)
  const card = firstHit(MICHAEL, isGrowingPattern)
  const wire = firstHit(MICHAEL, isFollowUpTransfer)
  if (!card || !wire) throw new Error(`Michael (${MICHAEL}): the pattern card or the follow-up hold did not fire`)
  const added = (payee: string) =>
    find(`Recipient Added ${payee}`, all, (e) => e.type === 'Recipient Added' && e.recipientId === payee)
  const completedAt = (p: KitEvent) =>
    find(`Payment Completed ${p.paymentId}`, all, (e) => e.type === 'Payment Completed' && e.paymentId === p.paymentId)
      .at

  const run = growingRun(card)
  const payees = [card.recipientId, wire.recipientId]
  const payments = all.filter((e) => e.type === 'Payment Initiated' && payees.includes(e.recipientId))
  const ids = new Set(payments.map((e) => e.paymentId))
  const onPayments = (type: string) => all.filter((e) => e.type === type && ids.has(e.paymentId))
  const wires = payments.filter((e) => e.recipientId === wire.recipientId)

  return {
    card,
    run,
    cardPayeeAdded: added(card.recipientId),
    runDays: calendarDays(run[0].at, card.at),
    cardToWireDays: calendarDays(card.at, wire.at),
    wire,
    wires,
    wirePayeeAdded: added(wire.recipientId),
    minutesSinceWirePayeeAdded: minutesBetween(added(wire.recipientId).at, wire.at),
    /** Blank days since the last wire: the kit has no earlier wire on record for him. */
    firstWireEver: wire.daysSinceLastSameRail === null,
    growingBeforeWire: run.filter((p) => completedAt(p) < wire.at).length,
    holdEnds: holdEndsFor(wire.at),
    callsEnd: atHour(wire.at, CALLS_END_HOUR),
    warnings: onPayments('Warning Displayed'),
    reported: find('Scam Reported', all, (e) => e.type === 'Scam Reported'),
    /** Sent to the two payees, less anything the kit says came back. */
    lost: cents(total(onPayments('Payment Completed')) - total(onPayments('Funds Recovered'))),
    alreadySent: total(payments.filter((e) => e.at < card.at)),
    fromCard: total(payments.filter((e) => e.at >= card.at)),
  }
}

export type MichaelFacts = ReturnType<typeof build>

let cached: MichaelFacts | null = null

export function michaelFacts(): MichaelFacts {
  cached ??= build()
  return cached
}

const ORDINAL = ['first', 'second', 'third']
export const ordinal = (n: number) => (n <= ORDINAL.length ? ORDINAL[n - 1] : `${n}th`)

/** "$87.95, $132.93, $220.12, $306.77" */
export const amounts = (list: KitEvent[]) => list.map((e) => money(e.amount)).join(', ')

/** The first line Michael sees on the card. */
export function patternFact(f: MichaelFacts = michaelFacts()) {
  return `This would be your ${ordinal(f.run.length)} payment in ${f.runDays} days to someone you added on ${shortDate(f.cardPayeeAdded.at)}, each bigger than the last: ${amounts(f.run)}.`
}

/** The first line he sees on the held wire. */
export function wireFact(f: MichaelFacts = michaelFacts()) {
  const first = f.firstWireEver ? 'your first wire ever' : 'a wire'
  return `This would be ${first}, to an account added ${f.minutesSinceWirePayeeAdded} minutes ago, after ${f.growingBeforeWire} growing payments to someone else you added on ${shortDate(f.cardPayeeAdded.at)}.`
}

/** "8 PM" */
export const hour = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric' })

/** What his held wire promises him, word for word what staff see is promised. */
export function callLine(f: MichaelFacts = michaelFacts()) {
  return `A specialist will call you before ${hour(f.callsEnd)} tonight, on the number you've had with us for a while. If we can't reach you before the hold ends, the wire isn't sent and the money stays in your account; you can send it again tomorrow.`
}

/** How his own screens name a payee: the kit has only IDs, and a member never sees those. */
export function payeeLabel(recipientId: string, f: MichaelFacts = michaelFacts()) {
  if (recipientId === f.wire.recipientId) return `the account you added ${shortDate(f.wirePayeeAdded.at)}`
  if (recipientId === f.card.recipientId) return `someone you added ${shortDate(f.cardPayeeAdded.at)}`
  return 'a payee'
}

export const TRUSTED_LINE = 'Talk to someone you trust before you send more.'
export const ROMANCE_LINE = 'Some of what you tapped is how a romance scam works.'

/** What staff say on the call while his wire is held. */
export function romanceScript(f: MichaelFacts) {
  return [
    "Thank you for taking our call. You haven't done anything wrong.",
    'Have you met the person this money is for in person?',
    'Romance scams often start with someone met online who talks about an investment, and payments that grow. Does any of that sound familiar?',
    `Would you talk to someone you trust before you send more? The wire stays on hold until ${clock(f.holdEnds)} while you do.`,
    "It's your money and your decision. If you still want it sent, we'll release it.",
  ]
}

const HONEST = ['Routine', 'Look-alike']

/** Romance and honest-member counts for one rule, on the kit's 118 members. */
export function kitCounts(rule: Parameters<typeof evaluate>[0]) {
  const groups = evaluate(rule)
  const romance = groups.find((g) => g.group === 'Romance / Investment')
  const lookalike = groups.find((g) => g.group === 'Look-alike')
  const honest = groups.filter((g) => HONEST.includes(g.group))
  const add = (key: 'flagged' | 'total') => honest.reduce((n, g) => n + g[key], 0)
  return { romance, lookalike, honest: { flagged: add('flagged'), total: add('total') } }
}
