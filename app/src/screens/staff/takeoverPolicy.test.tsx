/** Both answers to the open release (D1) and case-hold (D2) decisions, in logic and on screen. */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BRIEF_POLICY } from '../../data/briefPolicy'
import { POLICY } from '../../data/policy'
import { TakeoverCase, type TakeoverStage } from './TakeoverCase'
import { takeoverFacts } from './takeoverFacts'
import { caseHold, releaseHint, stageHint, yesReleases, yesReply } from './takeoverStages'

const defaults = { ...POLICY }

beforeEach(() => Object.assign(POLICY, BRIEF_POLICY))
afterEach(() => Object.assign(POLICY, defaults))

const staffText = (member: 'M1003' | 'M1039', stage: TakeoverStage) =>
  renderToStaticMarkup(<TakeoverCase member={member} stage={stage} />)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')

describe('the tiers the policy keys on', () => {
  it("treats Sarah's case as the full stop and M1039's as the light check", () => {
    expect(takeoverFacts('M1003').fullStop).toBe(true)
    expect(takeoverFacts('M1039').fullStop).toBe(false)
  })
})

describe('releasing a full stop (D1)', () => {
  it('releases on a YES from the prior contact when the policy is "yes"', () => {
    expect(yesReleases(true, 'yes')).toBe(true)
    expect(yesReply(true)).toBe("Thanks. We've released the payment for processing.")
    expect(releaseHint('asked', true)).toBe('Needs a YES on an unchanged contact')
    expect(releaseHint('its-me', true)).toBe('YES came from an unchanged contact')
    expect(stageHint('asked', true)).toBe('Waiting for the member. Release needs a YES on an unchanged contact.')
  })

  it('needs a callback to the prior number when the policy is "callback"', () => {
    expect(yesReleases(true, 'callback')).toBe(false)
    expect(yesReply(false)).toBe("Thanks. We'll call you at this number to confirm before we send it.")
    expect(releaseHint('asked', false)).toBe('Needs a callback to the number on file before the change')
    expect(releaseHint('its-me', false)).toBe('Call the number on file before the change first')
    expect(stageHint('asked', false)).toMatch(/A YES alone does not release it/)
    expect(stageHint('not-me', false)).toBe(stageHint('not-me', true))
  })

  it('always releases the light check on a YES', () => {
    expect(yesReleases(false, 'yes')).toBe(true)
    expect(yesReleases(false, 'callback')).toBe(true)
  })

  it('shows the matching release rule on the staff case', () => {
    expect(staffText('M1003', 'asked')).toContain('Needs a YES on an unchanged contact')
    POLICY.fullStopRelease = 'callback'
    expect(staffText('M1003', 'asked')).toContain('Needs a callback to the number on file before the change')
    expect(staffText('M1039', 'asked')).toContain('Needs a YES on an unchanged contact')
  })
})

describe('what a full-stop case holds (D2)', () => {
  const all = 'All outgoing payments held while this case is open.'
  const risky =
    'New payees, payee edits and profile changes held while this case is open. Scheduled payments to existing payees continue.'
  const riskyLocked =
    'Online access locked; new payees, payee edits and profile changes held. Scheduled payments to existing payees continue.'

  it('holds every outgoing payment when the policy is "all"', () => {
    for (const stage of ['paused', 'asked', 'not-me', 'secured', 'its-me'] as const) {
      expect(caseHold(stage, true, 'all')).toBe(all)
    }
  })

  it('holds only the risky changes when the policy is "risky", and names the lock once it is on', () => {
    expect(caseHold('asked', true, 'risky')).toBe(risky)
    expect(caseHold('not-me', true, 'risky')).toBe(risky)
    expect(caseHold('secured', true, 'risky')).toBe(riskyLocked)
  })

  it('holds nothing else before the case opens, after release, or on the light check', () => {
    for (const rule of ['all', 'risky'] as const) {
      expect(caseHold('watching', true, rule)).toBeNull()
      expect(caseHold('released', true, rule)).toBeNull()
      expect(caseHold('asked', false, rule)).toBeNull()
    }
  })

  it('shows the matching hold line on the staff case', () => {
    expect(staffText('M1003', 'paused')).toContain(all)
    expect(staffText('M1003', 'paused')).toContain('The case hold stops it.')
    expect(staffText('M1039', 'asked')).not.toContain('held while this case is open')
    POLICY.caseHold = 'risky'
    expect(staffText('M1003', 'paused')).toContain(risky)
    expect(staffText('M1003', 'secured')).toContain(riskyLocked)
    expect(staffText('M1003', 'paused')).not.toContain(all)
  })
})
