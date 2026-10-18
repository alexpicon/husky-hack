import { eventsFor, keyFor, type KitEvent } from '../../data/kit'
import { isTakeover, isTakeoverCheck, isTakeoverStop } from '../../data/takeoverRules'
import { evaluate, firstHit } from '../../data/triggers'
import { clock, day, minutesBetween } from '../../ui/format'

export const MEMBER = 'M1039'

/** Kit policy (Starter Kit, "Holds"): an ACH payment can be paused up to 4 hours. */
export const HOLD_HOURS = 4

/** Design assumption for the fast path: the member answers about a minute after the text. */
export const TAP_MINUTES = 1

const FAILED_LOGIN_WINDOW_MIN = 30

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`${MEMBER} story: expected ${what} in the kit data`)
  return value
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

const all = eventsFor(MEMBER)
const key = keyFor(MEMBER)
if (!key.lookalike) throw new Error(`${MEMBER} story: expected an honest look-alike in the member key`)

const payment = must(firstHit(MEMBER, isTakeoverCheck), 'a payment that trips the light check')
const before = all.filter((e) => e.at <= payment.at)
const lastBefore = (type: string) =>
  must(before.findLast((e) => e.type === type), `a ${type} event before ${payment.id}`)

const reset = lastBefore('Password Reset')
const address = lastBefore('Address Change')

const failedLogins = before.filter(
  (e) =>
    e.type === 'Failed Login' &&
    e.at <= reset.at &&
    minutesBetween(e.at, reset.at) <= FAILED_LOGIN_WINDOW_MIN,
)
if (failedLogins.length === 0) throw new Error(`${MEMBER} story: expected failed logins before the reset`)

const code = must(
  before.find((e) => e.type === 'One-Time Code Sent' && e.at >= reset.at),
  'a one-time code after the reset',
)
const alert = must(
  before.find((e) => e.type === 'Profile Change Alert Sent' && e.at >= address.at),
  'a profile change alert after the address change',
)
const recipientAdded = must(
  before.find((e) => e.type === 'Recipient Added' && e.recipientId === payment.recipientId),
  `the Recipient Added event for ${payment.recipientId}`,
)
const completed = must(
  all.find((e) => e.type === 'Payment Completed' && e.paymentId === payment.paymentId),
  `the Payment Completed event for ${payment.paymentId}`,
)

const isContactChange = (e: KitEvent) => e.type === 'Email Change' || e.type === 'Phone Change'
const contactChanges = all.filter(isContactChange)
if (contactChanges.length > 0) {
  throw new Error(
    `${MEMBER} story assumes email and phone never changed, but the kit has ${contactChanges.map((e) => e.id).join(', ')}`,
  )
}

const tapAt = new Date(payment.at.getTime() + TAP_MINUTES * 60_000)
const releasedCompletion = new Date(completed.at.getTime() + TAP_MINUTES * 60_000)
if (!sameDay(payment.at, releasedCompletion)) {
  throw new Error(`${MEMBER} story claims same-day delivery, but ${completed.id} would slip a day`)
}

const HONEST = ['Routine', 'Look-alike']

/** Members in the honest groups that a rule flags, out of all honest members. */
function honest(rule: (e: KitEvent) => boolean) {
  const groups = evaluate(rule).filter((g) => HONEST.includes(g.group))
  if (groups.length !== HONEST.length) throw new Error(`${MEMBER} story: expected ${HONEST.join(' and ')} groups`)
  return {
    flagged: groups.reduce((n, g) => n + g.flagged, 0),
    total: groups.reduce((n, g) => n + g.total, 0),
  }
}

const lookalikes = must(
  evaluate(isTakeoverCheck).find((g) => g.group === 'Look-alike'),
  'a Look-alike group in the light-check design check',
)
const honestAny = honest(isTakeover)

export type M1039Facts = {
  payment: KitEvent
  reset: KitEvent
  failedLogins: KitEvent[]
  code: KitEvent
  address: KitEvent
  alert: KitEvent
  recipientAdded: KitEvent
  completed: KitEvent
  tapAt: Date
  todayMinutes: number
  outcome: string
  /** Honest look-alikes the light check asks for one tap. */
  lookalikes: { flagged: number; total: number }
  /** Honest members (routine and look-alike) and how each tier treats them. */
  honest: { total: number; untouched: number; stopped: number }
}

export const facts: M1039Facts = {
  payment,
  reset,
  failedLogins,
  code,
  address,
  alert,
  recipientAdded,
  completed,
  tapAt,
  todayMinutes: minutesBetween(payment.at, completed.at),
  outcome: key.outcome,
  lookalikes: { flagged: lookalikes.flagged, total: lookalikes.total },
  honest: {
    total: honestAny.total,
    untouched: honestAny.total - honestAny.flagged,
    stopped: honest(isTakeoverStop).flagged,
  },
}

export const railLabel = (rail: string) => (rail === 'ACH' ? 'ACH bank transfer' : rail)

/** "Today, 12:50 PM" or "Yesterday, 11:51 AM", relative to the rent payment. */
export function whenLabel(d: Date) {
  const days = Math.round(
    (new Date(payment.at.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86_400_000,
  )
  const prefix = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : day(d)
  return `${prefix}, ${clock(d)}`
}
