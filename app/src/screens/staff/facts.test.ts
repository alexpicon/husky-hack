import { describe, expect, it } from 'vitest'
import { takeoverFacts } from './takeoverFacts'
import { trickedFacts, wireRuleText } from './trickedFacts'

const ids = (list: { id: string }[]) => list.map((e) => e.id)

describe('takeover case facts', () => {
  it("builds Sarah's case from the kit", () => {
    const f = takeoverFacts('M1003')
    expect(f.name).toBe('Sarah')
    expect(f.hit.id).toBe('E00203')
    expect(f.reset.id).toBe('E00197')
    expect(f.changes.map((c) => c.kind)).toEqual(['email', 'phone'])
    expect(f.recipientAdded.id).toBe('E00202')
    expect(ids(f.trail)[0]).toBe('E00195')
    expect(ids(f.trail).at(-1)).toBe('E00203')
    expect(f.followUp?.paymentId).toBe('P1003-008')
    expect(f.reported?.id).toBe('E00208')
  })

  it('builds the M1039 look-alike case from the kit', () => {
    const f = takeoverFacts('M1039')
    expect(f.name).toBe('Member M1039')
    expect(f.hit.paymentId).toBe('P1039-005')
    expect(f.changes.map((c) => c.kind)).toEqual(['address'])
    expect(ids(f.trail)[0]).toBe('E02553')
    expect(f.followUp).toBeUndefined()
  })
})

describe('tricked case facts', () => {
  it("builds Linda's wire hold from the kit", () => {
    const f = trickedFacts('M1001')
    expect(f.hit.paymentId).toBe('P1001-003')
    expect(f.minutesSinceAdded).toBe(7)
    expect(f.yearsSinceSameRail).toBe(6)
    expect(f.ratio).toBe('4.8')
    expect(f.holdEnds.getHours()).toBe(18)
    expect(f.holdEnds.getMinutes()).toBe(11)
    expect(f.trustedOnFile).toBe(false)
    expect(f.spokenCheck?.id).toBe('E00048')
  })
})

describe("the wire desk's rule line", () => {
  it('states each variant in 90th-percentile terms, never "usual"', () => {
    expect(wireRuleText('per-wire-3x')).toBe(
      "a wire at least 3x the member's 12-month 90th-percentile payment, to a recipient added less than 1 day ago.",
    )
    expect(wireRuleText('same-day-2.5x')).toBe(
      "a day's wires to a recipient added less than 1 day ago, together at least 2.5x the member's 12-month 90th-percentile payment.",
    )
  })
})
