import { eventsFor, keyFor, type KitEvent } from '../../data/kit'
import { firstHit, isTakeover } from '../../data/triggers'
import { clock, day, minutesBetween } from '../../ui/format'

export const SARAH = 'M1003'

const DAY_MS = 24 * 60 * 60 * 1000

function find(type: string, match: (e: KitEvent) => boolean = () => true): KitEvent {
  const hit = eventsFor(SARAH).find((e) => e.type === type && match(e))
  if (!hit) throw new Error(`${SARAH}: expected a "${type}" event in the kit`)
  return hit
}

const paused = firstHit(SARAH, isTakeover)
if (!paused) throw new Error(`${SARAH}: the takeover trigger did not fire on any payment`)

const failedLogin = find('Failed Login', (e) => e.at.toDateString() === paused.at.toDateString())
const tonight = (e: KitEvent) => e.at >= failedLogin.at && e.at <= paused.at

const codeSent = find('One-Time Code Sent', tonight)
const reset = find('Password Reset', tonight)
const login = find('Login', (e) => e.at >= reset.at && e.at <= paused.at)
const emailChange = find('Email Change', tonight)
const alertToOldEmail = find('Profile Change Alert Sent', tonight)
const phoneChange = find('Phone Change', tonight)
const recipientAdded = find('Recipient Added', (e) => e.recipientId === paused.recipientId)
const second = find(
  'Payment Initiated',
  (e) => e.recipientId === paused.recipientId && e.paymentId !== paused.paymentId,
)
const completedFirst = find('Payment Completed', (e) => e.paymentId === paused.paymentId)
const completedSecond = find('Payment Completed', (e) => e.paymentId === second.paymentId)
const reported = find('Scam Reported', (e) => e.at > completedSecond.at)
const recoveryFailed = eventsFor(SARAH).filter((e) => e.type === 'Recovery Unsuccessful')
if (recoveryFailed.length === 0) throw new Error(`${SARAH}: expected "Recovery Unsuccessful" events`)

const key = keyFor(SARAH)
const lastSent = completedSecond.at > completedFirst.at ? completedSecond : completedFirst

export const sarah = {
  failedLogin,
  codeSent,
  reset,
  login,
  emailChange,
  alertToOldEmail,
  phoneChange,
  recipientAdded,
  paused,
  second,
  completed: [completedFirst, completedSecond],
  reported,
  recoveryFailed,
  key,
  minutesResetToPause: minutesBetween(reset.at, paused.at),
  minutesRecipientToPause: minutesBetween(recipientAdded.at, paused.at),
  daysToReport: Math.floor((reported.at.getTime() - lastSent.at.getTime()) / DAY_MS),
  recovered: key.dollarsSent - key.netLoss,
}

export type SarahFacts = typeof sarah

/** "Thu, Oct 15 · 10:22 PM" for the story clock. */
export const storyClock = (d: Date) => `${day(d)} · ${clock(d)}`

/** Narrative minutes after the pause; not a kit timestamp. */
export const afterPause = (minutes: number) => new Date(paused.at.getTime() + minutes * 60_000)

/** What changed on the account tonight, in the order the member sees it. */
export const changesTonight = [
  { label: 'Password reset', event: reset },
  { label: 'Email changed', event: emailChange },
  { label: 'Phone number changed', event: phoneChange },
  { label: 'New recipient added', event: recipientAdded },
]
