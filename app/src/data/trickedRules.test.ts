/** Linda's rule in both variants on the kit data, and its edge cases on a made-up day. */
import { describe, expect, it } from 'vitest'
import type { KitEvent } from './kit'
import { POLICY } from './policy'
import { counts } from './testCounts'
import { firstHit, isTricked } from './triggers'
import { trickedRatio, trickedRule, type LindaRule } from './trickedRules'

const GROUPS = {
  family: 'Family Emergency',
  govt: 'Tech Support / Government Impersonation',
  romance: 'Romance / Investment',
  takeover: 'Sound Impersonation + ATO',
  routine: 'Routine',
  lookalike: 'Look-alike',
}

const expected: Record<LindaRule, Record<keyof typeof GROUPS, string>> = {
  'per-wire-3x': {
    family: '10/12',
    govt: '4/12',
    romance: '0/12',
    takeover: '0/12',
    routine: '0/50',
    lookalike: '0/20',
  },
  'same-day-2.5x': {
    family: '12/12',
    govt: '4/12',
    romance: '0/12',
    takeover: '0/12',
    routine: '0/50',
    lookalike: '0/20',
  },
}

const variants = Object.keys(expected) as LindaRule[]

describe.each(variants)("Linda's rule, %s", (rule) => {
  const trigger = trickedRule(rule)

  it('flags the kit groups it was checked on, and no honest member', () => {
    const want = Object.fromEntries(
      Object.entries(expected[rule]).map(([g, n]) => [GROUPS[g as keyof typeof GROUPS], n]),
    )
    expect(counts(trigger)).toEqual(want)
  })

  it("fires first on Linda's $8,500 wire, 2,411 days after her last one", () => {
    const hit = firstHit('M1001', trigger)
    expect(hit?.paymentId).toBe('P1001-003')
    expect(hit?.amount).toBe(8500)
    expect(hit?.daysSinceLastSameRail).toBe(2411)
    expect(trickedRatio(hit!, rule)).toBeCloseTo(4.77, 2)
  })

  it('never reads a blank recipient age as new', () => {
    const wire = firstHit('M1001', trigger)!
    expect(trigger({ ...wire, recipientAgeDays: null })).toBe(false)
    expect(trigger({ ...wire, recipientAgeDays: 1 })).toBe(false)
  })
})

describe('a split wire', () => {
  const wire = firstHit('M1001', trickedRule('per-wire-3x'))!
  const half = (id: string, minutes: number): KitEvent => ({
    ...wire,
    id,
    at: new Date(wire.at.getTime() + minutes * 60_000),
    amount: wire.amount / 2,
    baselineRatio: wire.baselineRatio! / 2,
  })
  const day = [half('A', 0), half('B', 2)]
  const history = () => day

  it('slips past the per-wire rule both times', () => {
    const rule = trickedRule('per-wire-3x', history)
    expect(day.map(rule)).toEqual([false, false])
  })

  it('is held on the second wire when the day is added up', () => {
    const rule = trickedRule('same-day-2.5x', history)
    expect(day.map(rule)).toEqual([false, true])
  })
})

describe('the rule in effect', () => {
  it('is the one POLICY.lindaRule names', () => {
    expect(counts(isTricked)).toEqual(counts(trickedRule(POLICY.lindaRule)))
  })
})
