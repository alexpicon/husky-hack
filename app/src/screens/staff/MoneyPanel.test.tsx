/** The staff money card: the rail's note and the payment's status in each rail's words. */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { POLICY } from '../../data/policy'
import { p2pRecalls } from '../../report/kitFacts'
import { MoneyPanel } from './MoneyPanel'
import type { TakeoverStage } from './TakeoverCase'
import { takeoverFacts } from './takeoverFacts'

const defaults = { ...POLICY }
afterEach(() => Object.assign(POLICY, defaults))

const panelText = (member: 'M1003' | 'M1039', stage: TakeoverStage) =>
  renderToStaticMarkup(<MoneyPanel f={takeoverFacts(member)} stage={stage} />)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')

describe('the P2P rail note', () => {
  it('counts the kit: 6 of 8 recalls on takeover P2P payments failed', () => {
    expect(p2pRecalls).toEqual({ requested: 8, failed: 6 })
  })

  it("says recalls usually fail on Sarah's P2P payment, and never that they can't be made", () => {
    const text = panelText('M1003', 'paused')
    expect(text).toContain("P2P recalls usually fail: 6 of 8 in the kit. So it's paused before send.")
    expect(text).not.toContain("can't be recalled")
  })
})

describe('the payment status', () => {
  it('says paused before send on P2P', () => {
    expect(takeoverFacts('M1003').hit.rail).toBe('P2P')
    for (const stage of ['paused', 'asked', 'not-me'] as const) {
      expect(panelText('M1003', stage)).toContain('Paused before send')
    }
    POLICY.fullStopRelease = 'yes'
    expect(panelText('M1003', 'its-me')).toContain('Paused, member said yes')
    POLICY.fullStopRelease = 'callback'
    expect(panelText('M1003', 'its-me')).toContain('Paused until the callback')
  })

  it('says held before release on ACH', () => {
    expect(takeoverFacts('M1039').hit.rail).toBe('ACH')
    for (const stage of ['paused', 'asked', 'not-me'] as const) {
      const text = panelText('M1039', stage)
      expect(text).toContain('Held before release')
      expect(text).not.toContain('Paused before send')
    }
    expect(panelText('M1039', 'its-me')).toContain('Held, member said yes')
  })
})
