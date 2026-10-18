/** The report's shared state, its wording under each policy, and the kit numbers it quotes. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BRIEF_POLICY } from '../data/briefPolicy'
import { POLICY } from '../data/policy'
import { linda } from '../story/linda'
import { m1039 } from '../story/m1039'
import { sarah } from '../story/sarah'
import { CALLBACK_MINUTES, p2pRecalls, reportToCaseMinutes } from './kitFacts'
import {
  callbackBy,
  initialReport,
  mergeReports,
  pausedLine,
  reportActions,
  reportLinkShown,
  reportRef,
  staffPausedLine,
  timeOfStoryClock,
  type ReportPlace,
} from './report'

// The stories' screens reach the cross-window sync, which needs a browser; these tests read only clocks.
vi.mock('../ui/look', () => ({ useLook: () => 'concept' }))
vi.mock('../shell/sync', () => ({ useWindowSync: () => {} }))

const defaults = { ...POLICY }
beforeEach(() => Object.assign(POLICY, BRIEF_POLICY))
afterEach(() => Object.assign(POLICY, defaults))

const atM1039: ReportPlace = { member: 'M1039', story: 'm1039', clock: 'Tue, Oct 6 · 12:55 PM' }
const atSarah: ReportPlace = { member: 'M1003', story: 'sarah', clock: 'Thu, Oct 15 · 10:24 PM' }

describe('kit numbers on the report screen', () => {
  it('counts P2P recalls: 6 of 8 failed', () => {
    expect(p2pRecalls).toEqual({ requested: 8, failed: 6 })
  })

  it('promises the call within the slowest report-to-case time in the kit', () => {
    expect(reportToCaseMinutes).toHaveLength(27)
    expect(Math.min(...reportToCaseMinutes)).toBe(1)
    expect(CALLBACK_MINUTES).toBe(20)
  })
})

describe('filing and sharing a report', () => {
  it('files once per member and keeps the case on a second tap', () => {
    const filed = reportActions.file(initialReport, atM1039)
    expect(filed).toEqual({ v: 1, report: { ...atM1039, stage: 'received' } })
    expect(reportActions.file(filed, atM1039)).toBe(filed)
  })

  it('moves to recall requested once, and never claims money back on its own', () => {
    const filed = reportActions.file(initialReport, atM1039)
    const recall = reportActions.requestRecall(filed)
    expect(recall.report?.stage).toBe('recall-requested')
    expect(reportActions.requestRecall(recall)).toBe(recall)
    expect(reportActions.requestRecall(initialReport)).toBe(initialReport)
  })

  it('closes only when the demo leaves the story it was filed in', () => {
    const filed = reportActions.file(initialReport, atSarah)
    expect(reportActions.leave(filed, 'm1039')).toBe(filed)
    expect(reportActions.leave(filed, 'sarah')).toEqual({ v: 2, report: null })
  })

  it('settles every window on the same copy, whichever merges first', () => {
    const a = reportActions.file(initialReport, atM1039)
    const b = reportActions.file(initialReport, atSarah)
    expect(mergeReports(a, b)).toEqual(mergeReports(b, a))
    const later = reportActions.requestRecall(a)
    expect(mergeReports(a, later)).toBe(later)
    expect(mergeReports(later, a)).toBe(later)
    expect(mergeReports(initialReport, a)).toBe(a)
  })
})

describe('where the link shows (D9)', () => {
  it("shows on every Sound app screen under the brief's 'everywhere'", () => {
    for (const zone of ['attacker', 'member', 'staff', null] as const) {
      expect(reportLinkShown(zone)).toBe(true)
    }
  })

  it("shows only on the real member's device when the policy is 'real-member'", () => {
    expect(reportLinkShown('member', 'real-member')).toBe(true)
    expect(reportLinkShown('attacker', 'real-member')).toBe(false)
    expect(reportLinkShown(null, 'real-member')).toBe(false)
  })
})

describe('what the report says it paused (D2)', () => {
  it("matches the brief's hold on every outgoing payment", () => {
    expect(pausedLine('CASE-X')).toBe("We've paused outgoing payments and opened case CASE-X.")
    expect(staffPausedLine()).toBe('Outgoing payments paused while this case is open.')
  })

  it('names only new recipients and profile changes when the policy is "risky"', () => {
    expect(pausedLine('CASE-X', 'risky')).toBe(
      "We've paused payments to new recipients and changes to your profile, and opened case CASE-X.",
    )
    expect(staffPausedLine('risky')).toBe(
      'Payments to new recipients and profile changes paused while this case is open.',
    )
  })
})

describe('times from the story clock', () => {
  it('reads every step clock in every story', () => {
    for (const story of [sarah, m1039, linda]) {
      for (const step of story.steps) {
        expect(() => timeOfStoryClock(step.clock), step.clock).not.toThrow()
      }
    }
  })

  it('names the case and the callback time from the moment of the report', () => {
    expect(reportRef(atM1039)).toBe('CASE-M1039-R1255')
    expect(callbackBy(atM1039, CALLBACK_MINUTES)).toBe('1:15 PM')
    expect(reportRef(atSarah)).toBe('CASE-M1003-R2224')
    expect(callbackBy(atSarah, CALLBACK_MINUTES)).toBe('10:44 PM')
    expect(callbackBy({ clock: 'Fri, Oct 16 · 11:50 PM' }, CALLBACK_MINUTES)).toBe('12:10 AM')
    expect(reportRef({ member: 'M1', clock: 'Fri, Oct 16 · 12:05 AM' })).toBe('CASE-M1-R0005')
  })

  it('refuses a clock with no time', () => {
    expect(() => timeOfStoryClock('Tue, Oct 6')).toThrow()
  })
})
