import { describe, expect, it } from 'vitest'
import { clock } from '../../ui/format'
import { changesTonight, sarah } from './facts'

describe("Sarah's takeover facts", () => {
  it('pauses the first fraudulent payment before it is sent', () => {
    expect(sarah.paused.paymentId).toBe('P1003-007')
    expect(sarah.paused.amount).toBe(1574.18)
    expect(sarah.paused.paymentStatus).toBe('Pending')
    expect(clock(sarah.paused.at)).toBe('10:22 PM')
  })

  it('lists what changed tonight in order', () => {
    expect(changesTonight.map(({ event }) => clock(event.at))).toEqual([
      '10:09 PM',
      '10:14 PM',
      '10:15 PM',
      '10:19 PM',
    ])
  })

  it('derives the timing and the real outcome', () => {
    expect(sarah.minutesResetToPause).toBe(13)
    expect(sarah.minutesRecipientToPause).toBe(3)
    expect(sarah.second.paymentId).toBe('P1003-008')
    expect(sarah.completed.map((e) => clock(e.at))).toEqual(['10:36 PM', '10:37 PM'])
    expect(sarah.daysToReport).toBe(2)
    expect(sarah.key.netLoss).toBe(3006.33)
    expect(sarah.recovered).toBe(0)
    expect(sarah.recoveryFailed).toHaveLength(2)
  })
})
