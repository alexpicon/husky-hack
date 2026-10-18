/** James's teller heads-up on the kit data, and its edges on a made-up week. */
import { describe, expect, it } from 'vitest'
import { clock } from '../ui/format'
import { eventsFor, memberKeys, type KitEvent } from './kit'
import { headsUpCashOut, isTellerHeadsUp, tellerHeadsUp } from './jamesRules'
import { counts } from './testCounts'
import { firstHit, groupOf } from './triggers'

const GOVT = 'Tech Support / Government Impersonation'

describe("James's heads-up", () => {
  it('fires on every government impersonation journey and no other', () => {
    expect(counts(isTellerHeadsUp)).toEqual({
      [GOVT]: '12/12',
      'Sound Impersonation + ATO': '0/12',
      'Family Emergency': '0/12',
      'Romance / Investment': '0/12',
      'Look-alike': '0/20',
      Routine: '0/50',
    })
  })

  it("fires first on James's $7,000 cash at 4:17 PM", () => {
    const hit = firstHit('M1004', isTellerHeadsUp)
    expect(hit?.paymentId).toBe('P1004-004')
    expect(hit?.rail).toBe('Cash')
    expect(hit?.amount).toBe(7000)
    expect(clock(hit!.at)).toBe('4:17 PM')
  })
})

describe('the rule reads the call by type and time only', () => {
  const cash = firstHit('M1004', isTellerHeadsUp)!
  const call = eventsFor('M1004').find((e) => e.type === 'Contact Center Call')!
  const week = (c: KitEvent) => () => [c, cash]
  const hoursBefore = (h: number) => new Date(cash.at.getTime() - h * 3_600_000)

  it('fires whatever the note says', () => {
    expect(tellerHeadsUp(week({ ...call, note: '' }))(cash)).toBe(true)
  })

  it('counts a call 72 hours before, not 73', () => {
    expect(tellerHeadsUp(week({ ...call, at: hoursBefore(72) }))(cash)).toBe(true)
    expect(tellerHeadsUp(week({ ...call, at: hoursBefore(73) }))(cash)).toBe(false)
  })

  it('needs a cash or wire payment that is starting', () => {
    const rule = tellerHeadsUp(week(call))
    expect(rule({ ...cash, rail: 'P2P' })).toBe(false)
    expect(rule({ ...cash, type: 'Payment Completed' })).toBe(false)
    expect(rule({ ...cash, rail: 'Wire' })).toBe(true)
  })
})

describe('scam cash in the kit', () => {
  const scam = new Set(memberKeys.flatMap((k) => k.scamPaymentIds))
  const group = (member: string) => groupOf(memberKeys.find((k) => k.member === member)!)
  const fate = (e: KitEvent, type: string) =>
    eventsFor(e.member).find((x) => x.type === type && x.paymentId === e.paymentId)
  const cash = memberKeys
    .flatMap((k) => eventsFor(k.member))
    .filter(
      (e) =>
        e.type === 'Payment Initiated' && e.rail === 'Cash' && e.amount >= 1000 && scam.has(e.paymentId),
    )
  const stopped = cash.filter((e) => fate(e, 'Payment Cancelled')?.channel === 'Branch')
  const out = cash.filter((e) => fate(e, 'Payment Completed'))
  const sum = (list: KitEvent[]) => list.reduce((s, e) => s + e.amount, 0)

  it('has 11 withdrawals of $1,000 or more: 6 stopped at the branch, 5 went out', () => {
    expect(cash).toHaveLength(11)
    expect([stopped.length, sum(stopped)]).toEqual([6, 28_250])
    expect([out.length, sum(out)]).toEqual([5, 35_500])
  })

  it('lost all 5 that went out to government impersonation, and the heads-up fires on each', () => {
    expect(out.map((e) => group(e.member))).toEqual(Array(5).fill(GOVT))
    expect(out.every(isTellerHeadsUp)).toBe(true)
  })

  it('finds the same 5 from events alone, for the screens', () => {
    const fromEvents = headsUpCashOut()
    expect(fromEvents.payments.map((e) => e.paymentId).sort()).toEqual(out.map((e) => e.paymentId).sort())
    expect(fromEvents.total).toBe(35_500)
  })
})
