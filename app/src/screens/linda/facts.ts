import { eventsFor, keyFor, type KitEvent } from '../../data/kit'
import { firstHit, isTricked } from '../../data/triggers'
import { minutesBetween, money } from '../../ui/format'

export const LINDA = 'M1001'

function find(label: string, list: KitEvent[], match: (e: KitEvent) => boolean): KitEvent {
  const hit = list.find(match)
  if (!hit) throw new Error(`Linda (${LINDA}): expected event "${label}" is missing from the kit`)
  return hit
}

export const plusMinutes = (d: Date, minutes: number) => new Date(d.getTime() + minutes * 60000)

const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** "$8,500" for whole amounts, "$1,574.18" otherwise. */
export const dollars = (n: number) => (Number.isInteger(n) ? usdWhole.format(n) : money(n))

export const shortDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

function build() {
  const all = eventsFor(LINDA)
  const wire = firstHit(LINDA, isTricked)
  if (!wire) throw new Error(`Linda (${LINDA}): the tricked trigger did not fire`)
  if (wire.daysSinceLastSameRail === null || wire.baselineRatio === null) {
    throw new Error(`Linda (${LINDA}): wire ${wire.id} is missing its baseline fields`)
  }
  const onWire = (type: string) => (e: KitEvent) =>
    e.type === type && e.paymentId === wire.paymentId
  const after = all.filter((e) => e.at >= wire.at)

  const sameDay = (e: KitEvent) => e.at.toDateString() === wire.at.toDateString()
  const visit = find('Branch Visit', all, (e) => e.type === 'Branch Visit' && sameDay(e))
  const added = find(
    'Recipient Added',
    all,
    (e) => e.type === 'Recipient Added' && e.recipientId === wire.recipientId,
  )
  const confirm = find('Confirmation Requested', after, onWire('Confirmation Requested'))
  const held = find('Payment Held', after, onWire('Payment Held'))
  const offered = find('Trusted Contact Offered', after, (e) => e.type === 'Trusted Contact Offered')
  const outreach = find('Employee Outreach', after, onWire('Employee Outreach'))
  const released = find('Payment Released', after, onWire('Payment Released'))
  const cash = find(
    'Cash Payment Initiated',
    after,
    (e) => e.type === 'Payment Initiated' && e.rail === 'Cash',
  )
  const cashStopped = find(
    'Payment Cancelled',
    after,
    (e) => e.type === 'Payment Cancelled' && e.paymentId === cash.paymentId,
  )
  const recallFailed = find('Recovery Unsuccessful', after, onWire('Recovery Unsuccessful'))
  const key = keyFor(LINDA)

  return {
    wire,
    visit,
    added,
    confirm,
    held,
    offered,
    outreach,
    released,
    cash,
    cashStopped,
    recallFailed,
    key,
    yearsSinceLastWire: Math.floor(wire.daysSinceLastSameRail / 365.25),
    minutesSinceAdded: minutesBetween(added.at, wire.at),
    ratio: wire.baselineRatio,
    scamName: `${key.subtype.split(' / ')[0].toLowerCase()} scam`,
  }
}

/** Story beats for the silent check, set relative to the wire the trigger caught. */
export function storyTimes() {
  const { wire } = lindaFacts()
  return {
    caught: wire.at,
    check: plusMinutes(wire.at, 1),
    match: plusMinutes(wire.at, 3),
    trusted: plusMinutes(wire.at, 4),
  }
}

export type LindaFacts = ReturnType<typeof build>

let cached: LindaFacts | null = null

export function lindaFacts(): LindaFacts {
  cached ??= build()
  return cached
}
