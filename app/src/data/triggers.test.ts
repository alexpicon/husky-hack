/** Both triggers reproduce the README's design check on the kit data. */
import { describe, expect, it } from 'vitest'
import { events, memberKeys } from './kit'
import { evaluate, firstHit, isTakeover, isTricked } from './triggers'

const counts = (trigger: Parameters<typeof evaluate>[0]) =>
  Object.fromEntries(evaluate(trigger).map((r) => [r.group, `${r.flagged}/${r.total}`]))

describe('kit', () => {
  it('loads every event and member', () => {
    expect(events).toHaveLength(7471)
    expect(memberKeys).toHaveLength(118)
  })
})

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
