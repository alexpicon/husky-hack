import { describe, expect, it } from 'vitest'
import { clock } from '../../ui/format'
import { facts } from './facts'

describe('M1039 facts', () => {
  it('derives the honest move from the kit', () => {
    expect(facts.failedLogins.map((e) => clock(e.at))).toEqual(['11:47 AM', '11:49 AM'])
    expect(clock(facts.reset.at)).toBe('11:51 AM')
    expect(clock(facts.code.at)).toBe('11:54 AM')
    expect(clock(facts.address.at)).toBe('12:07 PM')
    expect(clock(facts.alert.at)).toBe('12:21 PM')
    expect(clock(facts.recipientAdded.at)).toBe('12:50 PM')
  })

  it('pauses the rent payment that really completed with no friction', () => {
    expect(facts.payment.paymentId).toBe('P1039-005')
    expect(facts.payment.amount).toBe(4151.68)
    expect(clock(facts.completed.at)).toBe('1:07 PM')
    expect(facts.outcome).toBe('Legitimate - No Friction')
    expect(facts.lookalikes).toEqual({ flagged: 4, total: 20, moved: 4 })
  })
})
