import { eventsFor, keyFor, type KitEvent } from '../../data/kit'
import { firstHit, isTakeover, takeoverSignals, type TakeoverSignals } from '../../data/triggers'
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
  changes: ContactChange[]
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
  const changes = window
    .filter((e) => e.type in contactTypes)
    .map((event) => ({ kind: contactTypes[event.type], event }))
  if (changes.length === 0) throw new Error(`Staff console: no contact change for ${member}`)
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
