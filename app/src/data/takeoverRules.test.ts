/** The two takeover tiers reproduce the design check on the kit data. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BRIEF_POLICY } from './briefPolicy'
import { eventsFor, memberKeys, type KitEvent } from './kit'
import { POLICY } from './policy'
import {
  contactChangeConfirmed,
  isSessionTakeover,
  isTakeover,
  isTakeoverCheck,
  isTakeoverStop,
  takeoverTier,
} from './takeoverRules'
import { counts } from './testCounts'
import { firstHit } from './triggers'

const inEffect = { ...POLICY }
beforeEach(() => Object.assign(POLICY, BRIEF_POLICY))
afterEach(() => Object.assign(POLICY, inEffect))

const flaggedMembers = (rule: (e: KitEvent) => boolean) =>
  memberKeys.filter((k) => firstHit(k.member, rule)).map((k) => k.member)

const SCAM_GROUPS = ['Family Emergency', 'Romance / Investment', 'Tech Support / Government Impersonation']

describe('the full stop (email or phone changed)', () => {
  it('stops every takeover and no honest member', () => {
    expect(counts(isTakeoverStop)).toMatchObject({
      'Sound Impersonation + ATO': '12/12',
      Routine: '0/50',
      'Look-alike': '0/20',
      ...Object.fromEntries(SCAM_GROUPS.map((g) => [g, '0/12'])),
    })
  })

  it("fires first on Sarah's $1,574.18 payment, while it is still pending", () => {
    const hit = firstHit('M1003', isTakeoverStop)
    expect(hit?.paymentId).toBe('P1003-007')
    expect(hit?.amount).toBe(1574.18)
    expect(hit?.paymentStatus).toBe('Pending')
  })
})

describe('the light check (only the address changed)', () => {
  it('asks exactly the four honest movers and nobody else', () => {
    expect(flaggedMembers(isTakeoverCheck)).toEqual(['M1039', 'M1041', 'M1051', 'M1114'])
    expect(counts(isTakeoverCheck)).toMatchObject({
      'Sound Impersonation + ATO': '0/12',
      Routine: '0/50',
      'Look-alike': '4/20',
      ...Object.fromEntries(SCAM_GROUPS.map((g) => [g, '0/12'])),
    })
  })

  it("fires first on M1039's $4,151.68 rent payment", () => {
    const hit = firstHit('M1039', isTakeoverCheck)
    expect(hit?.paymentId).toBe('P1039-005')
    expect(hit?.amount).toBe(4151.68)
  })

  it('never overlaps the full stop', () => {
    const stopped = new Set(flaggedMembers(isTakeoverStop))
    expect(flaggedMembers(isTakeoverCheck).filter((m) => stopped.has(m))).toEqual([])
  })
})

describe('either tier', () => {
  it('keeps the callers that ask only "did a takeover rule fire?" working', () => {
    expect(counts(isTakeover)).toMatchObject({
      'Sound Impersonation + ATO': '12/12',
      Routine: '0/50',
      'Look-alike': '4/20',
      ...Object.fromEntries(SCAM_GROUPS.map((g) => [g, '0/12'])),
    })
    expect(firstHit('M1003', isTakeover)?.paymentId).toBe('P1003-007')
    expect(firstHit('M1039', isTakeover)?.paymentId).toBe('P1039-005')
  })
})

describe('the contact-change window and confirmation', () => {
  const pay = firstHit('M1003', isTakeoverStop) as KitEvent
  const DAY_MS = 24 * 3_600_000
  const phoneChange = (daysBefore: number): KitEvent => ({
    ...pay,
    id: 'TEST-PHONE',
    type: 'Phone Change',
    at: new Date(pay.at.getTime() - daysBefore * DAY_MS),
  })
  const night = (...extra: KitEvent[]) => () => [...extra, pay]

  it('counts a change up to 30 days before the payment, and none after it', () => {
    expect(takeoverTier(pay, { history: night(phoneChange(30)) })).toBe('stop')
    expect(takeoverTier(pay, { history: night(phoneChange(30.01)) })).toBeNull()
    expect(takeoverTier(pay, { history: night(phoneChange(-0.01)) })).toBeNull()
    expect(takeoverTier(pay, { history: night(phoneChange(0)) })).toBe('stop')
  })

  it('needs a reset and a new recipient', () => {
    const history = night(phoneChange(1))
    expect(takeoverTier({ ...pay, passwordResetRecent: false }, { history })).toBeNull()
    expect(takeoverTier({ ...pay, recipientStatus: 'Existing' }, { history })).toBeNull()
  })

  it('treats a confirmed email or phone change as the light check', () => {
    expect(memberKeys.some((k) => contactChangeConfirmed(k.member))).toBe(false)
    expect(takeoverTier(pay, { confirmed: () => true })).toBe('check')
  })
})

describe('D3, the 2-hour rule (payee added today, within 2 hours of a reset, code or failed sign-in)', () => {
  const takeovers = memberKeys.filter((k) => k.scenario === 'Sound Impersonation + ATO').map((k) => k.member)

  it('alone catches every takeover and none of the other 106 members', () => {
    expect(counts(isSessionTakeover)).toMatchObject({
      'Sound Impersonation + ATO': '12/12',
      Routine: '0/50',
      'Look-alike': '0/20',
      ...Object.fromEntries(SCAM_GROUPS.map((g) => [g, '0/12'])),
    })
    expect(flaggedMembers(isSessionTakeover)).toEqual(takeovers)
  })

  it('leaves the full stop at 12/12 and 0 of 70 honest members when it is on', () => {
    POLICY.sessionRule = true
    expect(counts(isTakeoverStop)).toMatchObject({
      'Sound Impersonation + ATO': '12/12',
      Routine: '0/50',
      'Look-alike': '0/20',
      ...Object.fromEntries(SCAM_GROUPS.map((g) => [g, '0/12'])),
    })
    expect(flaggedMembers(isTakeoverCheck)).toEqual(['M1039', 'M1041', 'M1051', 'M1114'])
    expect(firstHit('M1003', isTakeoverStop)?.paymentId).toBe('P1003-007')
  })

  describe('against attackers who change their steps', () => {
    /** The member's night with the attacker's steps edited, and the first scam payment in it. */
    const variant = (member: string, edit: (all: KitEvent[]) => KitEvent[]) => {
      const scam = firstHit(member, isTakeoverStop) as KitEvent
      const all = edit(eventsFor(member))
      return { pay: all.find((e) => e.id === scam.id) as KitEvent, history: () => all }
    }
    const noReset = (all: KitEvent[]) =>
      all.filter((e) => e.type !== 'Password Reset').map((e) => ({ ...e, passwordResetRecent: false }))
    const addressOnly = (all: KitEvent[]) =>
      all.map((e) => (e.type === 'Email Change' || e.type === 'Phone Change' ? { ...e, type: 'Address Change' } : e))

    it.each(takeovers)('%s still stops with no password reset only when the rule is on', (member) => {
      const { pay, history } = variant(member, noReset)
      expect(takeoverTier(pay, { history, sessionRule: false })).toBeNull()
      expect(takeoverTier(pay, { history, sessionRule: true })).toBe('stop')
    })

    it.each(takeovers)('%s still stops when only the address changes only when the rule is on', (member) => {
      const { pay, history } = variant(member, addressOnly)
      expect(takeoverTier(pay, { history, sessionRule: false })).toBe('check')
      expect(takeoverTier(pay, { history, sessionRule: true })).toBe('stop')
    })
  })
})
