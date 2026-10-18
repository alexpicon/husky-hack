/** Replaying one member's kit events through every rule, each judged on events up to its moment. */
import { describe, expect, it } from 'vitest'
import { eventsFor, memberKeys } from '../data/kit'
import { groupOf } from '../data/triggers'
import { clock } from '../ui/format'
import { columns } from './designCheck'
import { details, findMember, members, randomMember, replay, stepMember } from './memberReplay'
import { ordinal, REPLAY_RULES, span, type RuleKey } from './replayRules'

const hitsOf = (member: string, key: RuleKey) => replay(member).hits.filter((h) => h.rule.key === key)
const ids = (member: string, key: RuleKey) => hitsOf(member, key).map((h) => h.event.paymentId)

describe('the members a judge can name', () => {
  it('are every member in the kit, in id order', () => {
    expect(members).toHaveLength(118)
    expect(members).toEqual(memberKeys.map((k) => k.member).sort())
  })

  it('reads an id with or without the M, in any case', () => {
    for (const input of ['M1039', 'm1039', '1039', ' M1039 ', 'm 1039']) expect(findMember(input)).toBe('M1039')
  })

  it('finds nobody for an id outside the kit or a word', () => {
    for (const input of ['', 'M', 'M9999', '10', 'M10390', 'Linda', '1039x']) expect(findMember(input)).toBeNull()
  })

  it('steps to the next and previous member, wrapping at both ends', () => {
    expect(stepMember('M1001', 1)).toBe('M1002')
    expect(stepMember('M1002', -1)).toBe('M1001')
    expect(stepMember(members[0], -1)).toBe(members.at(-1))
    expect(stepMember(members.at(-1)!, 1)).toBe(members[0])
  })

  it('picks a random member other than the one shown', () => {
    for (const r of [0, 0.5, 0.999]) {
      const m = randomMember('M1001', () => r)
      expect(members).toContain(m)
      expect(m).not.toBe('M1001')
    }
  })
})

describe('the replay', () => {
  it('lists every event of the member, in time order', () => {
    for (const m of members) {
      const { events } = replay(m)
      expect(events).toHaveLength(eventsFor(m).length)
      for (let i = 1; i < events.length; i++) expect(events[i].at >= events[i - 1].at).toBe(true)
    }
  })

  it('fires each rule on exactly the events the rule fires on with the whole history', () => {
    for (const m of members) {
      for (const rule of REPLAY_RULES) {
        const whole = eventsFor(m).filter(rule.fires(eventsFor)).map((e) => e.id)
        expect(hitsOf(m, rule.key).map((h) => h.event.id)).toEqual(whole)
      }
    }
  })

  it('counts the same members per group as the Design check matrix', () => {
    const matrix = columns()
    for (const key of ['stop', 'check', 'linda', 'headsUp', 'pattern'] as const) {
      for (const r of matrix[key]) {
        const group = memberKeys.filter((k) => groupOf(k) === r.group)
        expect(group.filter((k) => hitsOf(k.member, key).length > 0)).toHaveLength(r.flagged)
      }
    }
  })

  it('lets each rule read only the events stamped up to the moment it fires', () => {
    for (const m of members) {
      const { events, hits } = replay(m)
      for (const h of hits) expect(h.seen).toBe(events.filter((e) => e.at <= h.event.at).length)
    }
  })
})

describe('the members the stories show', () => {
  it('Linda (M1001): her rule on the $8,500 wire, and nothing else', () => {
    const { hits } = replay('M1001')
    expect(hits.map((h) => [h.rule.label, h.event.paymentId])).toEqual([['Linda’s rule', 'P1001-003']])
    expect(hits[0].fact).toContain('Wire $8,500.00 to a payee added that day, 4.77x')
    expect(hits[0].fact).toContain('2,411 days since the last Wire')
  })

  it('Sarah (M1003): the full stop on both payments to the new payee, from the reset and both changes', () => {
    const { hits } = replay('M1003')
    expect(hits.map((h) => [h.rule.label, h.event.paymentId])).toEqual([
      ['Full stop', 'P1003-007'],
      ['Full stop', 'P1003-008'],
    ])
    expect(hits[0].event.amount).toBe(1574.18)
    expect(hits[0].fact).toMatch(
      /^P2P \$1,574\.18: reset flagged on the payment, a new recipient, and an email change at .+ and a phone change at .+ in the 30 days before, not confirmed on the old contact$/,
    )
  })

  it('M1039: the light check on the $4,151.68 rent, an address change only', () => {
    const { hits } = replay('M1039')
    expect(hits.map((h) => [h.rule.label, h.event.paymentId])).toEqual([['Light check', 'P1039-005']])
    expect(hits[0].event.amount).toBe(4151.68)
    expect(hits[0].fact).toMatch(/^ACH \$4,151\.68: .+, and only an address change at .+ in the 30 days before$/)
  })

  it('Michael (M1002): the card on his 4th growing payment, then the hold on every wire', () => {
    const card = hitsOf('M1002', 'pattern')[0]
    expect(card.event.paymentId).toBe('P1002-009')
    expect(card.fact).toBe(
      '4th growing payment in a row to R1002-08, a payee added 13 days earlier: $87.95, $132.93, $220.12, $306.77',
    )
    expect(ids('M1002', 'followUp')).toEqual(['P1002-010', 'P1002-011', 'P1002-012'])
    expect(hitsOf('M1002', 'followUp')[0].fact).toMatch(
      /^Wire \$1,500\.00 to R1002-09, a different payee added that day, .+ after the pattern card on R1002-08/,
    )
  })

  it('James (M1004): the heads-up on his $7,000 cash at 4:17 PM, after his call', () => {
    const first = hitsOf('M1004', 'headsUp')[0]
    expect(first.event.paymentId).toBe('P1004-004')
    expect(clock(first.event.at)).toBe('4:17 PM')
    expect(first.fact).toMatch(/^Cash \$7,000\.00, 26 h 13 min after a contact center call at .+ \(window: 72 h\)$/)
  })

  it('no routine member sets off any rule', () => {
    const routine = memberKeys.filter((k) => groupOf(k) === 'Routine')
    expect(routine).toHaveLength(50)
    for (const k of routine) expect(replay(k.member).hits).toEqual([])
  })
})

describe('the words on each row', () => {
  it('spans minutes, hours and days', () => {
    const at = (min: number) => new Date(2026, 9, 1, 0, min)
    expect(span(at(0), at(45))).toBe('45 min')
    expect(span(at(0), at(120))).toBe('2 h')
    expect(span(at(0), at(135))).toBe('2 h 15 min')
    expect(span(at(0), at(26 * 60 + 13))).toBe('26 h 13 min')
    expect(span(at(0), at(72 * 60))).toBe('3 days')
    expect(span(at(0), at(5 * 24 * 60 + 3 * 60 + 10))).toBe('5 days 3 h')
  })

  it('counts 4th, 11th, 21st and 22nd', () => {
    expect([4, 11, 12, 21, 22, 23].map(ordinal)).toEqual(['4th', '11th', '12th', '21st', '22nd', '23rd'])
  })

  it("shows Linda's wire row from its CSV fields", () => {
    const wire = eventsFor('M1001').find((e) => e.type === 'Payment Initiated' && e.paymentId === 'P1001-003')!
    expect(details(wire)).toEqual(['Wire $8,500.00', 'to R1001-11 (new, added 0 d before)', '4.77x baseline'])
  })
})
