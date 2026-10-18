/** Michael's pattern card and the follow-up hold, on the kit data and on edge cases. */
import { describe, expect, it } from 'vitest'
import { eventsFor, memberKeys, type KitEvent } from './kit'
import {
  followUpTransfer,
  growingPattern,
  growingRun,
  isFollowUpTransfer,
  isGrowingPattern,
} from './michaelRules'
import { counts } from './testCounts'
import { firstHit, groupOf } from './triggers'

const GROUPS = {
  family: 'Family Emergency',
  govt: 'Tech Support / Government Impersonation',
  romance: 'Romance / Investment',
  takeover: 'Sound Impersonation + ATO',
  routine: 'Routine',
  lookalike: 'Look-alike',
}

const named = (want: Record<keyof typeof GROUPS, string>) =>
  Object.fromEntries(Object.entries(want).map(([g, n]) => [GROUPS[g as keyof typeof GROUPS], n]))

const flagged = (group: string, trigger: (e: KitEvent) => boolean) =>
  memberKeys.filter((k) => groupOf(k) === group && firstHit(k.member, trigger)).map((k) => k.member)

const sum = (list: KitEvent[]) => Math.round(list.reduce((s, e) => s + e.amount, 0) * 100) / 100

describe('the pattern card', () => {
  it('flags every romance member and only the 3 look-alikes moving money to their own brokerage', () => {
    expect(counts(isGrowingPattern)).toEqual(
      named({ family: '0/12', govt: '0/12', romance: '12/12', takeover: '0/12', routine: '0/50', lookalike: '3/20' }),
    )
    expect(flagged(GROUPS.lookalike, isGrowingPattern)).toEqual(['M1064', 'M1090', 'M1101'])
    for (const m of ['M1064', 'M1090', 'M1101']) {
      expect(firstHit(m, isGrowingPattern)?.rail).toBe('External Transfer')
    }
  })

  it("fires first on Michael's $306.77 P2P at 10:28 AM on Sep 21, after $441.00 to that payee", () => {
    const hit = firstHit('M1002', isGrowingPattern)!
    expect(hit).toMatchObject({ paymentId: 'P1002-009', rail: 'P2P', amount: 306.77, recipientAgeDays: 13 })
    expect(hit.at).toEqual(new Date(2026, 8, 21, 10, 28))
    const run = growingRun(hit)
    expect(run.map((e) => e.amount)).toEqual([87.95, 132.93, 220.12, 306.77])
    expect(sum(run.slice(0, -1))).toBe(441)
  })

  it('never reads a blank payee age as new, and lets a 60-day-old payee go', () => {
    const hit = firstHit('M1002', isGrowingPattern)!
    expect(isGrowingPattern({ ...hit, recipientAgeDays: null })).toBe(false)
    expect(isGrowingPattern({ ...hit, recipientAgeDays: 60 })).toBe(false)
  })

  it('needs the run to grow every time: a smaller 4th payment starts over', () => {
    const hit = firstHit('M1002', isGrowingPattern)!
    expect(isGrowingPattern({ ...hit, amount: 220.12 })).toBe(false)
  })

  it('asks no more about a payee the member marked as their own account', () => {
    const own = new Set(['R1064-12', 'R1090-08', 'R1101-09'])
    expect(counts(growingPattern(eventsFor, own))[GROUPS.lookalike]).toBe('0/20')
  })
})

describe('the follow-up hold', () => {
  it('holds a transfer for every romance member and touches no honest member', () => {
    expect(counts(isFollowUpTransfer)).toEqual(
      named({ family: '0/12', govt: '0/12', romance: '12/12', takeover: '0/12', routine: '0/50', lookalike: '0/20' }),
    )
  })

  it("fires first on Michael's first wire, $1,500 at 7:25 PM on Sep 26, to a payee added that day", () => {
    const hit = firstHit('M1002', isFollowUpTransfer)!
    expect(hit).toMatchObject({ paymentId: 'P1002-010', rail: 'Wire', amount: 1500, recipientAgeDays: 0 })
    expect(hit.daysSinceLastSameRail).toBeNull()
    expect(hit.at).toEqual(new Date(2026, 8, 26, 19, 25))
  })

  it('needs a card first: with the card payee marked as his own, nothing is held', () => {
    expect(firstHit('M1002', followUpTransfer(eventsFor, new Set(['R1002-08'])))).toBeUndefined()
  })

  it('ignores a payment to the same payee as the card', () => {
    const wire = firstHit('M1002', isFollowUpTransfer)!
    expect(isFollowUpTransfer({ ...wire, recipientId: 'R1002-08' })).toBe(false)
  })
})
