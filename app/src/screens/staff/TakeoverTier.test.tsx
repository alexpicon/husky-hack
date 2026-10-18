/** The staff case names the takeover tier that fired and why. */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BRIEF_POLICY } from '../../data/briefPolicy'
import { POLICY } from '../../data/policy'
import { TakeoverCase, type TakeoverStage } from './TakeoverCase'
import { takeoverFacts, tierReasons } from './takeoverFacts'
import { TakeoverTier } from './TakeoverTier'

const inEffect = { ...POLICY }
beforeEach(() => Object.assign(POLICY, BRIEF_POLICY))
afterEach(() => Object.assign(POLICY, inEffect))

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')

const staffText = (member: 'M1003' | 'M1039', stage: TakeoverStage) =>
  textOf(renderToStaticMarkup(<TakeoverCase member={member} stage={stage} />))

describe("Sarah's case: the full stop", () => {
  it('is the full stop because her email and phone changed and nobody confirmed it', () => {
    const f = takeoverFacts('M1003')
    expect(f.tier).toBe('stop')
    expect(f.changeConfirmed).toBe(false)
    expect(tierReasons(f)).toHaveLength(1)
    expect(tierReasons(f)[0]).toMatch(/^Email and phone changed 10:14-10:15\sPM, not confirmed on the prior contact$/)
  })

  it('says so on the case once it is open', () => {
    const text = staffText('M1003', 'paused')
    expect(text).toContain('Account takeover · full stop')
    expect(text).toContain('Full stop')
    expect(text).toMatch(/Email and phone changed 10:14-10:15 PM, not confirmed on the prior contact/)
    expect(text).not.toContain('Contact change confirmed on the prior number')
  })

  it('names no tier while it is only watching', () => {
    const text = staffText('M1003', 'watching')
    expect(text).toContain('Account takeover watch')
    expect(text).not.toContain('Full stop')
    expect(text).not.toMatch(/Email and phone changed 10:14-10:15/)
  })
})

describe("M1039's case: the light check", () => {
  const f = takeoverFacts('M1039')

  it('is the light check because only the address changed', () => {
    expect(f.tier).toBe('check')
    expect(f.fullStop).toBe(false)
    expect(tierReasons(f)).toEqual(['Only the address changed: one tap on the unchanged phone'])
  })

  it('says so on the case', () => {
    const text = staffText('M1039', 'asked')
    expect(text).toContain('Account takeover · light check')
    expect(text).toContain('Light check')
    expect(text).toContain('Only the address changed: one tap on the unchanged phone')
  })
})

describe('a contact change confirmed on the prior number', () => {
  const confirmed = { ...takeoverFacts('M1003'), tier: 'check' as const, fullStop: false, changeConfirmed: true }

  it('drops "not confirmed" and adds the confirmation line', () => {
    const text = textOf(renderToStaticMarkup(<TakeoverTier f={confirmed} />))
    expect(text).toContain('Light check')
    expect(text).toMatch(/Email and phone changed 10:14-10:15 PM/)
    expect(text).not.toContain('not confirmed')
    expect(text).toContain('Contact change confirmed on the prior number')
  })
})

describe('D3, the 2-hour rule, on the staff case', () => {
  const rule = /2-hour rule: a payee added today, paid 13 min after a password reset/

  it('adds its reason to Sarah\'s full stop only when the rule is on', () => {
    expect(staffText('M1003', 'paused')).not.toMatch(rule)
    POLICY.sessionRule = true
    const text = staffText('M1003', 'paused')
    expect(text).toMatch(rule)
    expect(text).toMatch(/Email and phone changed 10:14-10:15 PM, not confirmed on the prior contact/)
    expect(text).toContain('Also a full stop: a payment to a payee added today, within 2 hours')
  })

  it('leaves M1039 on the light check, because they paid a day after their reset', () => {
    POLICY.sessionRule = true
    expect(takeoverFacts('M1039').tier).toBe('check')
    expect(staffText('M1039', 'asked')).not.toMatch(/2-hour rule:/)
  })
})
