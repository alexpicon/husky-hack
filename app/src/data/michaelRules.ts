import { eventsFor, type KitEvent } from './kit'

/** The payee must have been added less than this many days before the payment. */
export const PATTERN_PAYEE_MAX_AGE_DAYS = 60
/** The card shows on this payment of a strictly growing run to one payee, and on every later one. */
export const PATTERN_MIN_RUN = 4

/** The follow-up hold: a wire or external transfer to another payee added less than 30 days earlier... */
export const FOLLOW_UP_RAILS = ['Wire', 'External Transfer']
export const FOLLOW_UP_PAYEE_MAX_AGE_DAYS = 30
/** ...within 30 days after a pattern card. */
export const FOLLOW_UP_WINDOW_DAYS = 30

const DAY_MS = 86_400_000

type History = (member: string) => KitEvent[]

const initiated = (e: KitEvent) => e.type === 'Payment Initiated'

/** A blank age fails on purpose: in JavaScript `null < 60` is true. */
const payeeAddedWithin = (e: KitEvent, days: number) =>
  e.recipientAgeDays !== null && e.recipientAgeDays < days

/** Every payment started to this payment's payee, in order, up to and including it. */
export function paymentsTo(e: KitEvent, history: History = eventsFor): KitEvent[] {
  const earlier = history(e.member).filter(
    (p) => initiated(p) && p.id !== e.id && p.recipientId === e.recipientId && p.at <= e.at,
  )
  return [...earlier, e]
}

/** The strictly growing run of payments to one payee that ends with this payment. */
export function growingRun(e: KitEvent, history: History = eventsFor): KitEvent[] {
  const all = paymentsTo(e, history)
  let start = all.length - 1
  while (start > 0 && all[start].amount > all[start - 1].amount) start--
  return all.slice(start)
}

/**
 * The pattern card: the 4th or later strictly growing payment to a payee added less than
 * 60 days earlier. A payee the member marked as their own account is not asked about again.
 */
export function growingPattern(history: History = eventsFor, ownAccounts: ReadonlySet<string> = new Set()) {
  return (e: KitEvent) =>
    initiated(e) &&
    e.recipientId !== '' &&
    !ownAccounts.has(e.recipientId) &&
    payeeAddedWithin(e, PATTERN_PAYEE_MAX_AGE_DAYS) &&
    growingRun(e, history).length >= PATTERN_MIN_RUN
}

export const isGrowingPattern = growingPattern()

/**
 * The follow-up hold: a wire or external transfer to a different payee added less than 30
 * days earlier, within 30 days after a pattern card on that member.
 */
export function followUpTransfer(history: History = eventsFor, ownAccounts: ReadonlySet<string> = new Set()) {
  const card = growingPattern(history, ownAccounts)
  return (e: KitEvent) => {
    if (!initiated(e) || !FOLLOW_UP_RAILS.includes(e.rail)) return false
    if (!payeeAddedWithin(e, FOLLOW_UP_PAYEE_MAX_AGE_DAYS)) return false
    return history(e.member).some(
      (c) =>
        c.at < e.at &&
        e.at.getTime() - c.at.getTime() < FOLLOW_UP_WINDOW_DAYS * DAY_MS &&
        c.recipientId !== e.recipientId &&
        card(c),
    )
  }
}

export const isFollowUpTransfer = followUpTransfer()
