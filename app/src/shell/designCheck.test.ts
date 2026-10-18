/** The Design check's facts, derived from the kit under every rule variant, and the lines the page shows. */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { eventsFor } from '../data/kit'
import type { POLICY } from '../data/policy'
import {
  closingWire,
  columns,
  coverage,
  dollars,
  familySplit,
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

const ACTED_ON = { 'per-wire-3x': 26, 'same-day-2.5x': 28 }
const FAMILY_PAUSED = { 'per-wire-3x': 10, 'same-day-2.5x': 12 }

const counts = (results: { group: string; flagged: number; total: number }[]) =>
  Object.fromEntries(results.map((r) => [r.group, `${r.flagged}/${r.total}`]))

describe.each(VARIANTS)('the rules with session rule $sessionRule and $lindaRule', (policy) => {
  it(`acts on ${ACTED_ON[policy.lindaRule]} of 48 scam journeys and stops 0 of 70 honest members`, () => {
    expect(coverage(policy)).toEqual({
      scam: 48,
      actedOn: ACTED_ON[policy.lindaRule],
      honest: 70,
      stopped: 0,
      asked: 4,
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
  })

  it("adds no hold to M1057's closing wire, fires on nothing of Michael's and covers no cash", () => {
    expect(closingWire(policy).secondLookHolds).toBe(false)
    expect(michael(policy).fires).toBe(false)
    expect(scamCash(policy).ruleFires).toBe(false)
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

  it("takes Michael's loss from the Member Key", () => {
    const m = michael()
    expect(m.lost).toBe(8487.77)
    expect(m.payments.map((e) => e.rail)).toEqual(['P2P', 'P2P', 'P2P', 'P2P', 'Wire', 'Wire', 'Wire'])
  })

  it('counts scam cash withdrawals stopped at the branch and sent', () => {
    const cash = scamCash()
    expect(cash.total).toBe(11)
    expect(cash.stopped).toEqual({ count: 6, amount: 28250 })
    expect(cash.stoppedAt).toEqual(['Branch'])
    expect(cash.out).toEqual({ count: 5, amount: 35500 })
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
    return { POLICY: { ...real.POLICY, ...policy } }
  })
  const { PilotView } = await import('./PilotView')
  return text(renderToStaticMarkup(createElement(PilotView)))
}

afterEach(() => {
  vi.doUnmock('../data/policy')
})

describe('the page', () => {
  it('shows every Design check line under the default policy', async () => {
    const page = await renderWith()
    for (const line of [
      'With these rules we act on 26 of 48 kit scam journeys and stop 0 of 70 honest members.',
      'The light check asks the 4 honest members who moved for one tap; 66 of 70 see nothing.',
      'Synthetic data, about 41% scam victims by design. This shows how the design behaves, not real accuracy.',
      '4 with no hold or question lost $28,500',
      '4 who gave a coached yes lost $21,158',
      'the 4 who asked for help lost $0',
      'Of the 8 asked, 4 gave a coached yes.',
      'Linda’s rule pauses 10 of these 12.',
      'Second Look adds no hold to M1057’s $51,586.52 home-closing wire (payee added 2 days earlier); Sound’s existing wire review is unchanged.',
      '$8,487.77 lost; no rule fires; the report path is what still helps.',
      'Cash stays with the teller. In the kit, 6 of 11 scam withdrawals were stopped at the branch ($28,250); $35,500 still went out. No Second Look rule covers cash; a known gap.',
      'In the kit, Sound’s hold-and-text step saved every takeover it reached (6 of 6, $0 lost) and landed 13 to 15 minutes after the payment started. Where it never came, the money was gone 14 to 19 minutes after the start. Second Look moves that step to the moment the payment starts.',
    ]) {
      expect(page).toContain(line)
    }
  })

  it('counts 28 of 48 and pauses all 12 family wires under the same-day 2.5x rule', async () => {
    const page = await renderWith({ lindaRule: 'same-day-2.5x' })
    expect(page).toContain('With these rules we act on 28 of 48 kit scam journeys and stop 0 of 70 honest members.')
    expect(page).toContain('Linda’s rule pauses all 12.')
  })

  it('describes the full stop as the policy sets it', async () => {
    const brief = await renderWith()
    expect(brief).toContain('reset + email or phone change + new recipient')
    expect(brief).not.toContain('within 2 h')
    expect(brief).toContain('Held; a YES from the number on file before the change releases it')

    const reviewed = await renderWith({ sessionRule: true, fullStopRelease: 'callback' })
    expect(reviewed).toContain('or a payee added today within 2 h of a reset, code or failed sign-in')
    expect(reviewed).toContain('Held until a specialist calls the number on file before the change')
    expect(reviewed).toContain('act on 26 of 48 kit scam journeys and stop 0 of 70 honest members')
  })

  it('has no em or en dash', async () => {
    expect(await renderWith()).not.toMatch(/[\u2013\u2014]/)
  })
})
