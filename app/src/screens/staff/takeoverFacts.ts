import { eventsFor, keyFor, type KitEvent } from '../../data/kit'
import {
  contactChangeConfirmed,
  contactChanges,
  isStopChange,
  isTakeover,
  takeoverSignals,
  takeoverTier,
  type TakeoverSignals,
  type TakeoverTier,
} from '../../data/takeoverRules'
import { firstHit } from '../../data/triggers'
import { clock } from '../../ui/format'
import { need, when } from './helpers'

export type ContactKind = 'email' | 'phone' | 'address'

const contactTypes: Record<string, ContactKind> = {
  'Email Change': 'email',
  'Phone Change': 'phone',
  'Address Change': 'address',
}

const trailCategories = ['Authentication', 'Profile', 'Recipient']

export type ContactChange = { kind: ContactKind; event: KitEvent }

export type TakeoverFacts = {
  member: string
  name: string
  caseId: string
  hit: KitEvent
  signals: TakeoverSignals
  reset: KitEvent
  /** Email, phone and address changes in the rule's window before the payment. */
  changes: ContactChange[]
  tier: TakeoverTier
  /** The full stop: an email or phone change nobody confirmed. */
  fullStop: boolean
  /** The member confirmed their email or phone change on the contact they had before it. */
  changeConfirmed: boolean
  recipientAdded: KitEvent
  trail: KitEvent[]
  followUp?: KitEvent
  reported?: KitEvent
  dollarsSent: number
  netLoss: number
}

const cache = new Map<string, TakeoverFacts>()

export function takeoverFacts(member: string): TakeoverFacts {
  const cached = cache.get(member)
  if (cached) return cached
  const all = eventsFor(member)
  const key = keyFor(member)
  const hit = need(firstHit(member, isTakeover), `${member} payment matching the takeover trigger`)
  const at = all.indexOf(hit)
  const prior = all.slice(0, at)
  const reset = need(
    prior.findLast((e) => e.type === 'Password Reset'),
    `${member} Password Reset before ${hit.paymentId}`,
  )
  let start = prior.indexOf(reset)
  while (start > 0 && prior[start - 1].category === 'Authentication') start--
  const window = prior.slice(start)
  const changes = contactChanges(hit).map((event) => ({ kind: contactTypes[event.type], event }))
  if (changes.length === 0) throw new Error(`Staff console: no contact change for ${member}`)
  const tier = need(takeoverTier(hit), `${member} takeover tier for ${hit.paymentId}`)
  const recipientAdded = need(
    prior.findLast((e) => e.type === 'Recipient Added' && e.recipientId === hit.recipientId),
    `${member} Recipient Added for ${hit.recipientId}`,
  )
  const facts: TakeoverFacts = {
    member,
    name: key.persona || `Member ${member}`,
    caseId: `CASE-${member}-${hit.paymentId}`,
    hit,
    signals: takeoverSignals(hit),
    reset,
    changes,
    tier,
    fullStop: tier === 'stop',
    changeConfirmed: contactChangeConfirmed(member) && changes.some((c) => isStopChange(c.event)),
    recipientAdded,
    trail: [...window.filter((e) => trailCategories.includes(e.category)), hit],
    followUp: all
      .slice(at + 1)
      .find((e) => e.type === 'Payment Initiated' && e.recipientId === hit.recipientId),
    reported: all.slice(at + 1).find((e) => e.type === 'Scam Reported'),
    dollarsSent: key.dollarsSent,
    netLoss: key.netLoss,
  }
  cache.set(member, facts)
  return facts
}

export const changeOf = (f: TakeoverFacts, kind: ContactKind) =>
  f.changes.find((c) => c.kind === kind)

/** How Sound refers to a contact detail it can trust: the one on file before any change. */
export function priorContact(f: TakeoverFacts, kind: 'email' | 'phone', noun: string) {
  const c = changeOf(f, kind)
  return c
    ? { label: `${noun} on file before ${when(c.event, f.hit)}`, ids: [c.event.id], changed: true }
    : { label: `${noun} on file, unchanged`, ids: [] as string[], changed: false }
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** "10:14-10:15 PM", or "11:58 AM-12:03 PM" across noon. */
function clockRange(from: KitEvent, to: KitEvent, ref: KitEvent) {
  const start = when(from, ref)
  if (start === when(to, ref)) return start
  if (!sameDay(from.at, to.at)) return `${start} to ${when(to, ref)}`
  const end = clock(to.at)
  const [, time, period] = start.match(/^(.*)\s(AM|PM)$/) ?? []
  return period && end.endsWith(period) ? `${time}-${end}` : `${start}-${end}`
}

export const tierName = (f: TakeoverFacts) => (f.fullStop ? 'Full stop' : 'Light check')

/** Why this tier fired, in the words the staff card uses. */
export function tierReason(f: TakeoverFacts): string {
  const swapped = f.changes.filter((c) => c.kind !== 'address')
  if (swapped.length === 0) return 'Only the address changed: one tap on the unchanged phone'
  const kinds = [...new Set(swapped.map((c) => c.kind))].join(' and ')
  const range = clockRange(swapped[0].event, swapped[swapped.length - 1].event, f.hit)
  const what = `${kinds[0].toUpperCase()}${kinds.slice(1)} changed ${range}`
  return f.changeConfirmed ? what : `${what}, not confirmed on the prior contact`
}
