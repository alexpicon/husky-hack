/** The Design check's facts, derived from the kit under every rule variant, and the lines the page shows. */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { eventsFor } from '../data/kit'
import { BRIEF_POLICY } from '../data/briefPolicy'
import type { POLICY } from '../data/policy'
import {
  closingWire,
  columns,
  coverage,
  dollars,
  familySplit,
  familyUnder,
  followUpHolds,
  michael,
  minuteZero,
  scamCash,
  type RulePolicy,
} from './designCheck'

type Policy = typeof POLICY

const VARIANTS: RulePolicy[] = [
  { sessionRule: false, lindaRule: 'per-wire-3x' },
  { sessionRule: true, lindaRule: 'per-wire-3x' },
  { sessionRule: false, lindaRule: 'same-day-2.5x' },
  { sessionRule: true, lindaRule: 'same-day-2.5x' },
]

const ACTED_ON = { 'per-wire-3x': 46, 'same-day-2.5x': 48 }
const FAMILY_PAUSED = { 'per-wire-3x': 10, 'same-day-2.5x': 12 }
const FAMILY_UNDER = { 'per-wire-3x': ['M1019', 'M1035'], 'same-day-2.5x': [] }

const counts = (results: { group: string; flagged: number; total: number }[]) =>
  Object.fromEntries(results.map((r) => [r.group, `${r.flagged}/${r.total}`]))

describe.each(VARIANTS)('the rules with session rule $sessionRule and $lindaRule', (policy) => {
  it(`acts on ${ACTED_ON[policy.lindaRule]} of 48 scam journeys, stops 0 of 70 honest members and asks 7`, () => {
    expect(coverage(policy)).toEqual({
      scam: 48,
      actedOn: ACTED_ON[policy.lindaRule],
      honest: 70,
      stopped: 0,
      asked: 7,
      moved: 4,
      carded: 3,
      scamShare: 41,
    })
  })

  it('scores each column by group', () => {
    const c = columns(policy)
    expect(counts(c.stop)).toMatchObject({
      'Sound Impersonation + ATO': '12/12',
      'Family Emergency': '0/12',
      'Tech Support / Government Impersonation': '0/12',
      'Romance / Investment': '0/12',
      'Look-alike': '0/20',
      Routine: '0/50',
    })
    expect(counts(c.check)).toMatchObject({ 'Look-alike': '4/20', 'Sound Impersonation + ATO': '0/12' })
    expect(c.check.reduce((n, r) => n + r.flagged, 0)).toBe(4)
    expect(counts(c.linda)).toMatchObject({
      'Family Emergency': `${FAMILY_PAUSED[policy.lindaRule]}/12`,
      'Tech Support / Government Impersonation': '4/12',
      'Romance / Investment': '0/12',
      'Look-alike': '0/20',
      Routine: '0/50',
    })
    expect(counts(c.headsUp)).toEqual({
      'Sound Impersonation + ATO': '0/12',
      'Family Emergency': '0/12',
      'Tech Support / Government Impersonation': '12/12',
      'Romance / Investment': '0/12',
      'Look-alike': '0/20',
      Routine: '0/50',
    })
    expect(counts(c.pattern)).toEqual({
      'Sound Impersonation + ATO': '0/12',
      'Family Emergency': '0/12',
      'Tech Support / Government Impersonation': '0/12',
      'Romance / Investment': '12/12',
      'Look-alike': '3/20',
      Routine: '0/50',
    })
  })

  it("adds no hold to M1057's closing wire or to any scam cash, and names the family wires under the line", () => {
    expect(closingWire(policy).secondLookHolds).toBe(false)
    const cash = scamCash(policy)
    expect(cash.holds).toBe(false)
    expect([cash.headsUp, cash.government]).toEqual([7, 7])
    expect(familyUnder(policy).wires.map((w) => w.member)).toEqual(FAMILY_UNDER[policy.lindaRule])
  })
})

describe("Linda's family-emergency split", () => {
  const split = Object.fromEntries(familySplit().map((s) => [s.kind, s]))

  it('splits the 12 by whether Sound asked and what the member said', () => {
    expect(split['not asked'].members).toEqual(['M1012', 'M1073', 'M1080', 'M1084'])
    expect(split['coached yes'].members).toEqual(['M1001', 'M1019', 'M1020', 'M1072'])
    expect(split['asked for help'].members).toEqual(['M1015', 'M1035', 'M1054', 'M1106'])
  })

  it('totals each group from net_member_loss', () => {
    expect(dollars(split['not asked'].lost)).toBe('$28,500')
    expect(split['coached yes'].lost).toBeCloseTo(21158.36, 2)
    expect(dollars(split['coached yes'].lost)).toBe('$21,158')
    expect(split['asked for help'].lost).toBe(0)
  })

  it('had no hold either where nobody asked', () => {
    for (const m of split['not asked'].members) {
      expect(eventsFor(m).some((e) => e.type === 'Payment Held')).toBe(false)
    }
  })
})

describe('kit lines', () => {
  it("finds M1057's reviewed home-closing wire to a payee added 2 days earlier", () => {
    const { wire, review } = closingWire()
    expect(wire).toMatchObject({ paymentId: 'P1057-006', rail: 'Wire', amount: 51586.52, recipientAgeDays: 2 })
    expect(review.paymentId).toBe('P1057-006')
  })

  it("takes Michael's loss from the Member Key and finds his first $441.00 gone before the card", () => {
    const m = michael()
    expect(m.lost).toBe(8487.77)
    expect(m.payments.map((e) => e.rail)).toEqual(['P2P', 'P2P', 'P2P', 'P2P', 'Wire', 'Wire', 'Wire'])
    expect(m.card).toMatchObject({ paymentId: 'P1002-009', amount: 306.77 })
    expect(m.run).toBe(4)
    expect(m.hold).toMatchObject({ paymentId: 'P1002-010', rail: 'Wire', amount: 1500 })
    expect(m.before.map((e) => e.paymentId)).toEqual(['P1002-006', 'P1002-007', 'P1002-008'])
    expect(m.gone).toBe(441)
  })

  it("holds every wire to Michael's platform account for a call: $1,500, $2,400 and $3,840", () => {
    const { held } = michael()
    expect(held.map((e) => [e.paymentId, e.rail, e.amount, e.recipientId])).toEqual([
      ['P1002-010', 'Wire', 1500, 'R1002-09'],
      ['P1002-011', 'Wire', 2400, 'R1002-09'],
      ['P1002-012', 'Wire', 3840, 'R1002-09'],
    ])
    expect(held.reduce((n, e) => n + e.amount, 0)).toBe(7740)
  })

  it('holds all 30 romance scam wires and transfers, in 12 of 12 journeys, and no honest member', () => {
    expect(followUpHolds()).toEqual({
      scamMoves: 30,
      scamHeld: 30,
      journeys: 12,
      journeysHeld: 12,
      honest: 70,
      honestHeld: 0,
    })
  })

  it('names the 2 family wires under 3x', () => {
    const { ratio, wires } = familyUnder({ sessionRule: false, lindaRule: 'per-wire-3x' })
    expect(ratio).toBe(3)
    expect(wires.map((w) => [w.paymentId, w.amount, w.baselineRatio])).toEqual([
      ['P1019-004', 6000, 2.56],
      ['P1035-012', 6000, 2.59],
    ])
  })

  it('counts scam cash withdrawals stopped at the branch and sent, all of it sent by government impersonation', () => {
    const cash = scamCash()
    expect(cash.total).toBe(11)
    expect(cash.stopped).toEqual({ count: 6, amount: 28250 })
    expect(cash.stoppedAt).toEqual(['Branch'])
    expect(cash.out).toEqual({ count: 5, amount: 35500 })
    expect(cash.outGovernment).toBe(true)
  })

  it("times Sound's hold-and-text step against the money leaving", () => {
    const { reached, missed } = minuteZero()
    expect(reached.takeovers.map((t) => t.member)).toEqual(['M1010', 'M1027', 'M1046', 'M1047', 'M1050', 'M1115'])
    expect(reached).toMatchObject({ count: 6, saved: 6, lost: 0, from: 13, to: 15 })
    expect(missed.takeovers.map((t) => t.member)).toEqual(['M1003', 'M1007', 'M1016', 'M1058', 'M1105', 'M1111'])
    expect(missed).toMatchObject({ count: 6, from: 14, to: 19 })
    expect(dollars(missed.lost)).toBe('$15,666')
  })
})

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')

async function renderWith(policy: Partial<Policy> = {}) {
  vi.resetModules()
  vi.doMock('../data/policy', async (load) => {
    const real = await load<{ POLICY: Policy }>()
    return { POLICY: { ...real.POLICY, ...BRIEF_POLICY, ...policy } }
  })
  const { PilotView } = await import('./PilotView')
  return text(renderToStaticMarkup(createElement(PilotView)))
}

afterEach(() => {
  vi.doUnmock('../data/policy')
})

describe('the page', () => {
  it("shows every Design check line under the brief's policy", async () => {
    const page = await renderWith()
    for (const line of [
      'With these rules we act on 46 of 48 kit scam journeys and stop 0 of 70 honest members; 7 of 70 get one tap or a card.',
      'The light check asks the 4 honest members who moved for one tap, and the pattern card shows to 3 honest look-alikes, who can tap “This is my own account” once; 63 of 70 see nothing.',
      'Synthetic data, about 41% scam victims by design. This shows how the design behaves, not real accuracy.',
      '4 with no hold or question lost $28,500',
      '4 who gave a coached yes lost $21,158',
      'the 4 who asked for help lost $0',
      'Of the 8 asked, 4 gave a coached yes.',
      'Linda’s rule pauses 10 of these 12.',
      'Second Look adds no hold to M1057’s $51,586.52 home-closing wire (payee added 2 days earlier); Sound’s existing wire review is unchanged.',
      'Michael (M1002), a relationship investment scam, caught late',
      'His first $441.00 is gone before the card: it shows on his 4th growing payment ($306.77), and every wire after it to his platform account is held for a call: $1,500.00, $2,400.00 and $3,840.00. The card is advice; he decides. In the kit he lost $8,487.77.',
      'The hold reaches all 30 romance scam wires and transfers (12 of 12 journeys) and 0 of 70 honest members.',
      '2 family emergencies under 3x',
      'M1019 wired $6,000.00 at 2.56x and M1035 wired $6,000.00 at 2.59x their 12-month 90th-percentile payment, under the line, so Linda’s rule leaves them alone.',
      'James’s heads-up is not a hold: the teller decides, and a member who insists can still take the cash.',
      'Cash stays with the teller. James’s heads-up reaches the teller on all 7 government impersonation cash requests. In the kit, without it, 6 of 11 scam withdrawals were stopped at the branch ($28,250) and $35,500 still went out.',
      'In the kit, Sound’s hold-and-text step saved every takeover it reached (6 of 6, $0 lost) and landed 13 to 15 minutes after the payment started. Where it never came, the money was gone 14 to 19 minutes after the start. Second Look moves that step to the moment the payment starts.',
    ]) {
      expect(page).toContain(line)
    }
  })

  it('counts 48 of 48 and pauses all 12 family wires under the same-day 2.5x rule', async () => {
    const page = await renderWith({ lindaRule: 'same-day-2.5x' })
    expect(page).toContain('With these rules we act on 48 of 48 kit scam journeys and stop 0 of 70 honest members;')
    expect(page).toContain('Linda’s rule pauses all 12.')
    expect(page).not.toContain('family emergencies under')
  })

  it('describes the full stop as the policy sets it', async () => {
    const brief = await renderWith()
    expect(brief).toContain('reset + email or phone change + new recipient')
    expect(brief).not.toContain('within 2 h')
    expect(brief).toContain('Held; a YES from the number on file before the change releases it')

    const reviewed = await renderWith({ sessionRule: true, fullStopRelease: 'callback' })
    expect(reviewed).toContain('or a payee added today within 2 h of a reset, code or failed sign-in')
    expect(reviewed).toContain('Held until a specialist calls the number on file before the change')
    expect(reviewed).toContain('act on 46 of 48 kit scam journeys and stop 0 of 70 honest members')
  })

  it('has no em or en dash', async () => {
    expect(await renderWith()).not.toMatch(/[\u2013\u2014]/)
  })
})
