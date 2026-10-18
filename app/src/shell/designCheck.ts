import { eventsFor, keyFor, memberKeys, type KitEvent, type MemberKey } from '../data/kit'
import { POLICY } from '../data/policy'
import { takeoverTier } from '../data/takeoverRules'
import { trickedRule } from '../data/trickedRules'
import { evaluate, firstHit, groupOf, type GroupResult } from '../data/triggers'
import { minutesBetween } from '../ui/format'

/** The open decisions that change what the Design check counts (D3 and D4). */
export type RulePolicy = Pick<typeof POLICY, 'sessionRule' | 'lindaRule'>

type Trigger = (e: KitEvent) => boolean

const TAKEOVER = 'Sound Impersonation + ATO'
export const FAMILY = 'Family Emergency'
export const HOME_BUYER = 'M1057'
const MICHAEL = 'M1002'

const HONEST_GROUPS = ['Routine', 'Look-alike']
const isHonest = (k: MemberKey) => HONEST_GROUPS.includes(groupOf(k))

/** Each Second Look rule as the policy sets it. */
function rulesFor(policy: RulePolicy = POLICY) {
  const tier = (e: KitEvent) => takeoverTier(e, { sessionRule: policy.sessionRule })
  const rules = {
    stop: (e: KitEvent) => tier(e) === 'stop',
    check: (e: KitEvent) => tier(e) === 'check',
    linda: trickedRule(policy.lindaRule),
  }
  const any: Trigger = (e) => rules.stop(e) || rules.check(e) || rules.linda(e)
  return { ...rules, any }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const fires = (k: MemberKey, t: Trigger) => firstHit(k.member, t) !== undefined
const isScamPayment = (k: MemberKey) => (e: KitEvent) => k.scamPaymentIds.includes(e.paymentId)
const byTime = (a: KitEvent, b: KitEvent) => a.at.getTime() - b.at.getTime()

const cache = new Map<string, unknown>()
function memo<T>(name: string, policy: RulePolicy, build: () => T): T {
  const key = `${name}:${policy.sessionRule}:${policy.lindaRule}`
  if (!cache.has(key)) cache.set(key, build())
  return cache.get(key) as T
}

/** Matrix columns: the members of each group each rule pauses at least once. */
export function columns(policy: RulePolicy = POLICY): Record<'stop' | 'check' | 'linda', GroupResult[]> {
  return memo('columns', policy, () => {
    const r = rulesFor(policy)
    return { stop: evaluate(r.stop), check: evaluate(r.check), linda: evaluate(r.linda) }
  })
}

/** The one denominator: scam journeys any rule acts on, honest members held or asked. */
export function coverage(policy: RulePolicy = POLICY) {
  return memo('coverage', policy, () => {
    const r = rulesFor(policy)
    const scam = memberKeys.filter((k) => !isHonest(k))
    const honest = memberKeys.filter(isHonest)
    return {
      scam: scam.length,
      actedOn: scam.filter((k) => fires(k, r.any)).length,
      honest: honest.length,
      stopped: honest.filter((k) => fires(k, r.stop) || fires(k, r.linda)).length,
      asked: honest.filter((k) => fires(k, r.check)).length,
      scamShare: Math.round((scam.length / memberKeys.length) * 100),
    }
  })
}

/** How a family-emergency journey went when Sound asked about the payment in person. */
export type Asked = 'not asked' | 'coached yes' | 'asked for help'

const ANSWERS: Record<string, Asked> = {
  'Confirmed Intended': 'coached yes',
  'Requested Help': 'asked for help',
}

/** The kit's 12 family-emergency journeys, split by Sound's question and the answer. */
export function familySplit() {
  const family = memberKeys.filter((k) => k.scenario === FAMILY)
  const asked = (k: MemberKey): Asked => {
    const q = eventsFor(k.member).find((e) => e.type === 'Confirmation Requested' && isScamPayment(k)(e))
    if (!q) return 'not asked'
    const answer = ANSWERS[q.memberResponse]
    if (!answer) throw new Error(`Unexpected answer ${q.memberResponse} for ${k.member}`)
    return answer
  }
  const order: Asked[] = ['not asked', 'coached yes', 'asked for help']
  return order.map((kind) => {
    const members = family.filter((k) => asked(k) === kind)
    return { kind, members: members.map((k) => k.member), lost: sum(members.map((k) => k.netLoss)) }
  })
}

/** M1057's home-closing wire: the payment Sound's existing wire review held. */
export function closingWire(policy: RulePolicy = POLICY) {
  const all = eventsFor(HOME_BUYER)
  const review = all.find((e) => e.type === 'Payment Held')
  const wire = all.find((e) => e.type === 'Payment Initiated' && e.paymentId === review?.paymentId)
  if (!review || !wire) throw new Error(`${HOME_BUYER} has no reviewed wire in the kit`)
  return { wire, review, secondLookHolds: all.some(rulesFor(policy).any) }
}

/** Michael's romance scam: what he lost and whether any rule fires on his events. */
export function michael(policy: RulePolicy = POLICY) {
  const key = keyFor(MICHAEL)
  const all = eventsFor(MICHAEL)
  return {
    lost: key.netLoss,
    payments: all.filter((e) => e.type === 'Payment Initiated' && isScamPayment(key)(e)),
    fires: all.some(rulesFor(policy).any),
  }
}

/** Every scam cash withdrawal in the kit, split by whether it was cancelled or completed. */
export function scamCash(policy: RulePolicy = POLICY) {
  const cashOut = (k: MemberKey) => (e: KitEvent) =>
    e.type === 'Payment Initiated' && e.rail === 'Cash' && isScamPayment(k)(e)
  const rows = memberKeys.flatMap((k) => eventsFor(k.member).filter(cashOut(k)))
  const ending = (e: KitEvent, type: string) =>
    eventsFor(e.member).find((x) => x.type === type && x.paymentId === e.paymentId)
  const stopped = rows.filter((e) => ending(e, 'Payment Cancelled'))
  const out = rows.filter((e) => ending(e, 'Payment Completed'))
  return {
    total: rows.length,
    stopped: { count: stopped.length, amount: sum(stopped.map((e) => e.amount)) },
    stoppedAt: [...new Set(stopped.map((e) => ending(e, 'Payment Cancelled')?.channel))],
    out: { count: out.length, amount: sum(out.map((e) => e.amount)) },
    ruleFires: rows.some(rulesFor(policy).any),
  }
}

/** One takeover, timed from its first scam payment to Sound's hold, or to the money leaving. */
export type TakeoverClock = { member: string; minutes: number; lost: number }

/**
 * Sound's own step in the kit: hold the payment and text the number on file before the change.
 * Where it came, minutes from the first scam payment to the hold; where it never came, minutes
 * until the last scam payment completed.
 */
export function minuteZero() {
  const reached: TakeoverClock[] = []
  const missed: TakeoverClock[] = []
  for (const k of memberKeys.filter((m) => m.scenario === TAKEOVER)) {
    const scam = eventsFor(k.member).filter(isScamPayment(k)).sort(byTime)
    const start = scam.find((e) => e.type === 'Payment Initiated')
    if (!start) throw new Error(`${k.member} has no scam payment`)
    const held = scam.find((e) => e.type === 'Payment Held')
    const texted = scam.some((e) => e.type === 'Confirmation Requested')
    const gone = scam.filter((e) => e.type === 'Payment Completed').at(-1)
    const clock = (end: KitEvent) => ({
      member: k.member,
      minutes: minutesBetween(start.at, end.at),
      lost: k.netLoss,
    })
    if (held && texted) reached.push(clock(held))
    else if (gone) missed.push(clock(gone))
  }
  const summary = (xs: TakeoverClock[]) => {
    const minutes = xs.map((x) => x.minutes)
    return {
      takeovers: xs,
      count: xs.length,
      saved: xs.filter((x) => x.lost === 0).length,
      lost: sum(xs.map((x) => x.lost)),
      from: Math.min(...minutes),
      to: Math.max(...minutes),
    }
  }
  return { reached: summary(reached), missed: summary(missed) }
}

/** Whole dollars, for totals the page rounds: $21,158.36 reads as $21,158. */
export const dollars = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
