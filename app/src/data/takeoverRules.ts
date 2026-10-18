import { eventsFor, type KitEvent } from './kit'
import { POLICY } from './policy'

/** An email, phone or address change counts if it falls in this many days up to the payment. */
export const CONTACT_WINDOW_DAYS = 30
/** D3: a reset, code or failed sign-in counts if it falls in this many hours up to the payment. */
export const SESSION_WINDOW_HOURS = 2

/** The full stop holds the payment; the light check asks for one tap on the unchanged phone. */
export type TakeoverTier = 'stop' | 'check'

const STOP_CHANGES = ['Email Change', 'Phone Change']
const CHECK_CHANGES = ['Address Change']
const SESSION_EVENTS = ['Password Reset', 'One-Time Code Sent', 'Failed Login']

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

type History = (member: string) => KitEvent[]

export type TakeoverOptions = {
  /** The member's events; tests swap in a made-up night. */
  history?: History
  /** D3, the 2-hour rule. Defaults to POLICY.sessionRule, read each time the rule runs. */
  sessionRule?: boolean
  /** Defaults to contactChangeConfirmed. */
  confirmed?: (member: string) => boolean
}

/** The member's events of these types in the `ms` up to and including the payment, by timestamp. */
function before(e: KitEvent, types: string[], ms: number, history: History): KitEvent[] {
  const to = e.at.getTime()
  return history(e.member).filter(
    (x) => types.includes(x.type) && x.at.getTime() >= to - ms && x.at.getTime() <= to,
  )
}

/** Email, phone and address changes in the 30 days up to the payment, oldest first. */
export const contactChanges = (e: KitEvent, history: History = eventsFor) =>
  before(e, [...STOP_CHANGES, ...CHECK_CHANGES], CONTACT_WINDOW_DAYS * DAY_MS, history)

/** An email or phone change: the details a scammer swaps to catch Sound's confirmations. */
export const isStopChange = (e: KitEvent) => STOP_CHANGES.includes(e.type)

/**
 * Whether the member confirmed their email or phone change on the contact they had before it.
 * The kit has no such event, so this is false for every kit member. A confirmed change counts
 * toward the light check, not the full stop.
 */
export function contactChangeConfirmed(_member: string): boolean {
  return false
}

/** A blank age fails on purpose: in JavaScript `null < 1` is true. */
const payeeAddedToday = (e: KitEvent) => e.recipientAgeDays !== null && e.recipientAgeDays < 1

/** Resets, one-time codes and failed sign-ins in the 2 hours up to the payment, oldest first. */
export const sessionEvents = (e: KitEvent, history: History = eventsFor) =>
  before(e, SESSION_EVENTS, SESSION_WINDOW_HOURS * HOUR_MS, history)

const sessionTakeover = (e: KitEvent, history?: History) =>
  e.type === 'Payment Initiated' && payeeAddedToday(e) && sessionEvents(e, history).length > 0

/** D3: a payment to a payee added today, within 2 hours of a reset, a code or a failed sign-in. */
export const isSessionTakeover = (e: KitEvent) => sessionTakeover(e)

/** Which tier, if any, a payment falls in. */
export function takeoverTier(e: KitEvent, opts: TakeoverOptions = {}): TakeoverTier | null {
  if ((opts.sessionRule ?? POLICY.sessionRule) && sessionTakeover(e, opts.history)) return 'stop'
  if (e.type !== 'Payment Initiated' || !e.passwordResetRecent || e.recipientStatus !== 'New') {
    return null
  }
  const changes = contactChanges(e, opts.history)
  const confirmed = (opts.confirmed ?? contactChangeConfirmed)(e.member)
  if (!confirmed && changes.some(isStopChange)) return 'stop'
  return changes.length > 0 ? 'check' : null
}

/** Full stop: a reset, a new recipient, and an email or phone change nobody confirmed; or D3. */
export const isTakeoverStop = (e: KitEvent) => takeoverTier(e) === 'stop'

/** Light check: a reset, a new recipient, and only an address change. */
export const isTakeoverCheck = (e: KitEvent) => takeoverTier(e) === 'check'

/** Either tier, for callers that only ask whether a takeover rule fired. */
export const isTakeover = (e: KitEvent) => takeoverTier(e) !== null

export type TakeoverSignals = {
  passwordReset: boolean
  contactChange: boolean
  newRecipient: boolean
}

export function takeoverSignals(e: KitEvent): TakeoverSignals {
  return {
    passwordReset: e.passwordResetRecent,
    contactChange: contactChanges(e).length > 0,
    newRecipient: e.recipientStatus === 'New',
  }
}
