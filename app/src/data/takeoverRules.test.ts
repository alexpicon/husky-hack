/** The takeover trigger reproduces the README's design check on the kit data. */
import { describe, expect, it } from 'vitest'
import { counts } from './testCounts'
import { firstHit, isTakeover } from './triggers'

describe('takeover trigger', () => {
  it('flags every takeover and no routine member', () => {
    expect(counts(isTakeover)).toMatchObject({
      'Sound Impersonation + ATO': '12/12',
      Routine: '0/50',
      'Look-alike': '4/20',
      'Family Emergency': '0/12',
      'Romance / Investment': '0/12',
      'Tech Support / Government Impersonation': '0/12',
    })
  })

  it("fires on Sarah's first fraudulent payment, before it is sent", () => {
    const hit = firstHit('M1003', isTakeover)
    expect(hit?.paymentId).toBe('P1003-007')
    expect(hit?.amount).toBe(1574.18)
    expect(hit?.paymentStatus).toBe('Pending')
  })

  it("fires on M1039's real rent payment", () => {
    expect(firstHit('M1039', isTakeover)?.amount).toBe(4151.68)
  })
})
