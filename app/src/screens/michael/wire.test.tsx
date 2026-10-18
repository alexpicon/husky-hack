/** Michael's held wire: the call before the contact center closes, and his choice carried to step 3 and staff. */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { events } from '../../data/kit'
import { CALLS_END_HOUR } from '../../data/michaelRules'
import { michael } from '../../story/michael'
import { clock } from '../../ui/format'
import { checkActions, initialCheck, mergeChecks, type WireChoice } from './check'
import { writeCheck } from './checkState'
import { callLine, holdEndsFor, michaelFacts } from './facts'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .trim()

const [, wireStep, reportStep] = michael.steps
const text = (node: React.ReactNode) => textOf(renderToStaticMarkup(<>{node}</>))
const choose = (wire: WireChoice | null) => writeCheck({ ...initialCheck, v: 1, wire })

describe('the hold ends when calls do', () => {
  it('holds his 7:25 PM wire until 8 PM, when the contact center stops calling', () => {
    const f = michaelFacts()
    expect(clock(f.wire.at)).toBe('7:25 PM')
    expect(clock(f.holdEnds)).toBe('8:00 PM')
  })

  it('keeps the 4-hour cap earlier in the day', () => {
    expect(clock(holdEndsFor(new Date(2026, 8, 26, 10, 0)))).toBe('2:00 PM')
    expect(clock(holdEndsFor(new Date(2026, 8, 26, 17, 30)))).toBe('8:00 PM')
  })

  it('matches the kit: every Contact Center event falls before calls end', () => {
    const calls = events.filter((e) => e.channel === 'Contact Center')
    expect(calls.length).toBeGreaterThan(0)
    for (const e of calls) expect(e.at.getHours()).toBeLessThan(CALLS_END_HOUR)
  })
})

describe.each(['concept', 'sound'] as const)('his choice on the held wire (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
    choose(null)
  })

  it('promises the same call on his screen and on the staff console, with nothing after hours', () => {
    const line =
      "A specialist will call you before 8 PM tonight, on the number you've had with us for a while. If we can't reach you before the hold ends, the wire isn't sent and the money stays in your account; you can send it again tomorrow."
    expect(callLine()).toBe(line)
    const member = text(wireStep.member)
    const staff = text(wireStep.staff)
    expect(member).toContain(line)
    expect(staff).toContain(line)
    expect(staff).toContain('never past 8 PM, when calls end')
    for (const page of [member, staff]) expect(page).not.toContain('11:25')
  })

  it('carries a cancel to staff and to the day he reports', () => {
    choose('cancel')
    expect(text(wireStep.member)).toContain('Cancelled. Nothing was sent')
    expect(text(wireStep.staff)).toContain('Cancelled by Michael · not sent')
    const member = text(reportStep.member)
    expect(member).toContain('Sep 26 · Wire · Cancelled, not sent')
    expect(member).not.toContain('-$1,500.00')
    expect(member).toContain('-$2,400.00')
    expect(member).toContain('Here he cancelled the $1,500.00 wire, so it never left his account.')
    expect(member).toContain('In the kit, without Second Look $8,487.77')
    expect(text(reportStep.staff)).toContain('He cancelled it, so nothing was sent; in the kit it was.')
  })

  it.each([['wait'], [null]] as const)('shows the wire as sent after "%s", as in the kit', (wire) => {
    choose(wire)
    expect(text(wireStep.staff)).toContain('On hold')
    const member = text(reportStep.member)
    expect(member).toContain('-$1,500.00')
    expect(member).not.toContain('Cancelled, not sent')
    expect(member).not.toContain('Here he cancelled')
    expect(text(reportStep.staff)).toContain('Until 8:00 PM. He decides.')
  })

  it('names payees on his screens without the kit IDs', () => {
    for (const step of michael.steps) expect(text(step.member)).not.toMatch(/\b[RP]1002-\d+/)
    expect(text(reportStep.member)).toContain('To the account you added Sep 26')
    expect(text(reportStep.member)).toContain('To someone you added Sep 8')
  })
})

describe('a new demo run', () => {
  const answered = { ...initialCheck, run: 1, v: 7, taps: ['never-met' as const], shared: true, wire: 'cancel' as const }

  it('starts him over, and an older run never clears a newer one', () => {
    expect(checkActions.forRun(answered, 2)).toEqual({ ...initialCheck, run: 2, v: 7 })
    expect(checkActions.forRun(answered, 1)).toBe(answered)
    expect(checkActions.forRun(answered, 0)).toBe(answered)
  })

  it('wins over an older run even with fewer edits, and the first step keeps the run', () => {
    const fresh = { ...initialCheck, run: 2, v: 1 }
    expect(mergeChecks(answered, fresh)).toBe(fresh)
    expect(mergeChecks(fresh, answered)).toBe(fresh)
    expect(checkActions.reset(answered)).toEqual({ ...initialCheck, run: 1, v: 7 })
  })
})
