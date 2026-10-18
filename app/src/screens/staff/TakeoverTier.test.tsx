/** The staff case names the takeover tier that fired and why. */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TakeoverCase, type TakeoverStage } from './TakeoverCase'
import { takeoverFacts, tierReason } from './takeoverFacts'
import { TakeoverTier } from './TakeoverTier'

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')

const staffText = (member: 'M1003' | 'M1039', stage: TakeoverStage) =>
  textOf(renderToStaticMarkup(<TakeoverCase member={member} stage={stage} />))

describe("Sarah's case: the full stop", () => {
  const f = takeoverFacts('M1003')

  it('is the full stop because her email and phone changed and nobody confirmed it', () => {
    expect(f.tier).toBe('stop')
    expect(f.changeConfirmed).toBe(false)
    expect(tierReason(f)).toMatch(/^Email and phone changed 10:14-10:15\sPM, not confirmed on the prior contact$/)
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
    expect(tierReason(f)).toBe('Only the address changed: one tap on the unchanged phone')
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
