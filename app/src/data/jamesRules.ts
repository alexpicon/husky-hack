import { events, eventsFor, type KitEvent } from './kit'

/** A contact center call counts if it falls in this many hours before the payment. */
export const HEADS_UP_WINDOW_HOURS = 72

const HOUR_MS = 3_600_000
const RAILS = ['Cash', 'Wire']

type History = (member: string) => KitEvent[]

/**
 * The member's contact center calls in the 72 hours up to the payment, oldest first. Only the
 * event type and timestamp count: the call's note is free text and the rule never reads it.
 */
export function recentCalls(e: KitEvent, history: History = eventsFor): KitEvent[] {
  const to = e.at.getTime()
  const from = to - HEADS_UP_WINDOW_HOURS * HOUR_MS
  return history(e.member).filter(
    (x) => x.type === 'Contact Center Call' && x.at.getTime() >= from && x.at.getTime() <= to,
  )
}

/** James's rule; tests swap `history` for a made-up week. */
export function tellerHeadsUp(history: History = eventsFor) {
  return (e: KitEvent) =>
    e.type === 'Payment Initiated' && RAILS.includes(e.rail) && recentCalls(e, history).length > 0
}

/** A cash or wire payment that starts within 72 hours of a call to the contact center. */
export const isTellerHeadsUp = tellerHeadsUp()

const completed = new Set(
  events.filter((e) => e.type === 'Payment Completed').map((e) => e.paymentId),
)

/** Cash the heads-up would have fired on that went out in the kit, from kit events alone. */
export function headsUpCashOut() {
  const payments = events.filter(
    (e) => isTellerHeadsUp(e) && e.rail === 'Cash' && completed.has(e.paymentId),
  )
  return { payments, total: payments.reduce((sum, e) => sum + e.amount, 0) }
}
