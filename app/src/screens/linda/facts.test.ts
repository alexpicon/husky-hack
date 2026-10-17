import { describe, expect, it } from 'vitest'
import { clock } from '../../ui/format'
import { lindaFacts } from './facts'

describe("Linda's facts come from the kit", () => {
  const f = lindaFacts()

  it('finds the held wire and its first-line fact', () => {
    expect(f.wire.paymentId).toBe('P1001-003')
    expect(f.wire.amount).toBe(8500)
    expect(f.yearsSinceLastWire).toBe(6)
    expect(f.minutesSinceAdded).toBe(7)
    expect(f.scamName).toBe('grandparent scam')
  })

  it('replays the day in order', () => {
    const times = [f.visit, f.added, f.wire, f.confirm, f.held, f.offered, f.outreach, f.released]
    expect(times.map((e) => clock(e.at))).toEqual([
      '2:00 PM',
      '2:04 PM',
      '2:11 PM',
      '2:14 PM',
      '2:21 PM',
      '2:26 PM',
      '3:42 PM',
      '5:04 PM',
    ])
    expect(f.offered.memberResponse).toBe('Declined Offer')
  })

  it('records the stopped bail cash and the lost wire', () => {
    expect(f.cash.amount).toBe(4250)
    expect(f.cashStopped.note).toContain('bail')
    expect(f.recallFailed.paymentId).toBe(f.wire.paymentId)
    expect(f.key.netLoss).toBe(8500)
  })
})
