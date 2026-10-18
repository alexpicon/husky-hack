import { describe, expect, it } from 'vitest'
import { MIN_FITTING_TAPS as JAMES_MIN } from '../screens/james/copy'
import { MIN_FITTING_TAPS as LINDA_MIN } from '../screens/linda/scams'
import {
  bareId,
  clipQuote,
  GROUP_RESULTS,
  isPanelResult,
  leadingGroups,
  MIN_FITTING_TAPS,
  NO_PATTERN,
  PANEL_RESULTS,
  QUOTE_MAX,
  resultFor,
  WALL_CODE,
  type PanelGroup,
} from './results'

describe('the result allowlist', () => {
  it('holds one line per scam and the no-pattern line, nothing else', () => {
    expect(PANEL_RESULTS).toEqual([
      'fits grandparent scam · wire held',
      'fits government scam · teller heads-up',
      'fits relationship investment scam · every wire gets a call',
      "doesn't fit one pattern · a person still checks",
    ])
    expect(isPanelResult(GROUP_RESULTS.romance)).toBe(true)
    expect(isPanelResult('safe')).toBe(false)
    expect(isPanelResult('fits grandparent scam')).toBe(false)
    expect(isPanelResult(42)).toBe(false)
  })

  it('never reads as an all-clear', () => {
    for (const r of PANEL_RESULTS) {
      expect(r).not.toMatch(/\bsafe\b|verified|no risk/i)
      expect(r).not.toMatch(/[\u2013\u2014]/)
    }
  })
})

describe('naming a scam from her confirmed taps', () => {
  const taps = (...ids: string[]) => ids.map((id) => ({ id, group: id.split('.')[0] as PanelGroup }))

  it('uses the same 2-tap rule as the stories', () => {
    expect(MIN_FITTING_TAPS).toBe(LINDA_MIN)
    expect(MIN_FITTING_TAPS).toBe(JAMES_MIN)
  })

  it('names nothing with no taps or one tap', () => {
    expect(resultFor([])).toBe(NO_PATTERN)
    expect(resultFor(taps('grandparent.family'))).toBe(NO_PATTERN)
    expect(resultFor(taps('grandparent.family', 'government.waiting', 'romance.investment'))).toBe(NO_PATTERN)
    expect(resultFor(taps('grandparent.secret', 'government.secret', 'romance.secret'))).toBe(NO_PATTERN)
  })

  it('names the group with 2 or more taps', () => {
    expect(resultFor(taps('grandparent.family', 'grandparent.bail'))).toBe(GROUP_RESULTS.grandparent)
    expect(resultFor(taps('government.investigation', 'government.waiting', 'grandparent.bail'))).toBe(
      GROUP_RESULTS.government,
    )
    expect(resultFor(taps('romance.never-met', 'romance.investment', 'romance.emergency'))).toBe(GROUP_RESULTS.romance)
  })

  it('names the group with the most taps when two pass', () => {
    const romance = taps('romance.investment', 'romance.secret')
    const grandparent = taps('grandparent.family', 'grandparent.bail', 'grandparent.secret')
    expect(resultFor([...romance, ...grandparent])).toBe(GROUP_RESULTS.grandparent)
  })

  it('breaks a tie on the taps no other story shares', () => {
    const officer = taps('grandparent.official', 'grandparent.secret', 'government.investigation', 'government.secret')
    expect(resultFor(officer)).toBe(GROUP_RESULTS.government)
    const coached = taps('grandparent.coached', 'grandparent.secret', 'government.coached', 'government.waiting')
    expect(resultFor(coached)).toBe(GROUP_RESULTS.government)
    expect(leadingGroups(officer)).toEqual(['government'])
  })

  it('gives a tie that stays to the grandparent story, which the phone asks about', () => {
    const arrested = taps('grandparent.family', 'grandparent.secret', 'government.investigation', 'government.secret')
    expect(resultFor(arrested)).toBe(GROUP_RESULTS.grandparent)
  })

  it('names none when the other two stories tie', () => {
    const mixed = taps('government.investigation', 'government.secret', 'romance.investment', 'romance.secret')
    expect(leadingGroups(mixed)).toEqual(['government', 'romance'])
    expect(resultFor(mixed)).toBe(NO_PATTERN)
  })

  it('reads a tap by its own id, after its scam', () => {
    expect(bareId('romance.never-met')).toBe('never-met')
  })
})

describe('the quote on the wall', () => {
  it('keeps a short quote as typed, on one line', () => {
    expect(clipQuote('  my son needs bail ')).toBe('my son needs bail')
    expect(clipQuote('lawyer says\n\ndon\'t   tell mom')).toBe("lawyer says don't tell mom")
    expect(clipQuote('a\u0000b\tc')).toBe('a b c')
  })

  it('keeps exactly 40 characters without an ellipsis', () => {
    const forty = 'x'.repeat(QUOTE_MAX)
    expect(clipQuote(forty)).toBe(forty)
  })

  it('cuts anything longer to 40 characters and an ellipsis', () => {
    const text = "my grandson's lawyer called, he is in jail and needs bail money today, don't tell his mom"
    const clipped = clipQuote(text)
    expect(clipped).toBe(`${text.slice(0, 40).trimEnd()}…`)
    expect(Array.from(clipped).length).toBeLessThanOrEqual(QUOTE_MAX + 1)
    expect(clipped).not.toContain('needs bail money')
  })

  it('never splits an emoji, and clipping twice changes nothing', () => {
    const text = `${'a'.repeat(39)}🙂🙂🙂`
    const clipped = clipQuote(text)
    expect(clipped).toBe(`${'a'.repeat(39)}🙂…`)
    expect(clipQuote(clipped)).toBe(clipped)
  })
})

describe('wall codes', () => {
  it('takes 4 to 8 capitals and digits', () => {
    expect(WALL_CODE.test('AB12')).toBe(true)
    expect(WALL_CODE.test('ABCDE234')).toBe(true)
    expect(WALL_CODE.test('ab12')).toBe(false)
    expect(WALL_CODE.test('AB1')).toBe(false)
    expect(WALL_CODE.test('AB-12')).toBe(false)
  })
})
