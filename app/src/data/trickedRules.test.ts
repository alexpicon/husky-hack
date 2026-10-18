/** The tricked-member trigger reproduces the README's design check on the kit data. */
import { describe, expect, it } from 'vitest'
import { counts } from './testCounts'
import { firstHit, isTricked } from './triggers'

describe('tricked trigger', () => {
  it('matches the README design check', () => {
    expect(counts(isTricked)).toMatchObject({
      'Family Emergency': '10/12',
      'Tech Support / Government Impersonation': '4/12',
      'Romance / Investment': '1/12',
      Routine: '0/50',
      'Look-alike': '4/20',
    })
  })

  it("fires on Linda's $8,500 wire", () => {
    const hit = firstHit('M1001', isTricked)
    expect(hit?.amount).toBe(8500)
    expect(hit?.daysSinceLastSameRail).toBe(2411)
  })
})
