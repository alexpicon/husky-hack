/** The silent check says only what her own taps support, and staff see only what she shares. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { SOUND } from '../../ui/soundApp'
import { TrickedCase } from '../staff/TrickedCase'
import { storyTimes } from './facts'
import { caseActions, initialCase, LindaCaseContext, type LindaCase } from './lindaCase'
import { MatchResult } from './MatchResult'
import { SilentCheck } from './SilentCheck'
import { TAP_OPTIONS, toggleTap, type TapId } from './taps'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look switch syncs across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))

const entities: Record<string, string> = {
  '&#x27;': "'",
  '&quot;': '"',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
}

/** The words a reader sees: tags dropped, entities decoded, whitespace collapsed. */
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')

const withCase = (state: LindaCase, node: ReactNode) =>
  textOf(
    renderToStaticMarkup(
      <LindaCaseContext.Provider value={{ state, update: () => {} }}>{node}</LindaCaseContext.Provider>,
    ),
  )

const tapped = (taps: TapId[], extra: Partial<LindaCase> = {}): LindaCase => ({
  ...initialCase,
  taps,
  ...extra,
})

const CALL_BACK = 'on the number YOU saved, not a number someone gave you today.'
const COMBOS: TapId[][] = [
  [],
  ['none'],
  ['other'],
  ['family'],
  ['family', 'secret'],
  ['family', 'official', 'secret', 'bail', 'coached'],
  ['family', 'secret', 'private'],
]

describe.each(['concept', 'sound'] as const)('the member tablet (%s look)', (variant) => {
  beforeAll(() => {
    look.current = variant
  })

  it('renders the variant for its look', () => {
    const html = renderToStaticMarkup(<MatchResult />)
    expect(html.includes(SOUND.canvas)).toBe(variant === 'sound')
  })

  it.each(COMBOS.map((c) => [c.join('+') || 'nothing', c] as const))(
    'after %s: shows the call-back line and never says "safe"',
    (_, taps) => {
      const result = withCase(tapped(taps), <MatchResult />)
      expect(result).toContain(CALL_BACK)
      expect(result).not.toMatch(/\bsafe\b/i)
      expect(withCase(tapped(taps), <SilentCheck />)).not.toMatch(/\bsafe\b/i)
    },
  )

  it('names a scam only from two or more of her taps', () => {
    const named = 'Some of what you tapped is how the grandparent scam works.'
    expect(withCase(tapped(['family', 'bail']), <MatchResult />)).toContain(named)
    for (const taps of [[], ['family'], ['other'], ['none'], ['coached']] as TapId[][]) {
      const text = withCase(tapped(taps), <MatchResult />)
      expect(text).not.toContain('grandparent')
      expect(text).toContain("We can't confirm this request from your answers.")
    }
  })

  it('shows her no scam words when she asks to talk privately', () => {
    const text = withCase(tapped(['family', 'secret', 'private']), <MatchResult />)
    expect(text).toContain("We'll find you a private place to talk.")
    expect(text).not.toMatch(/scam|fraud/i)
  })

  it('offers every answer, "None of these" and talking privately', () => {
    const text = withCase(initialCase, <SilentCheck />)
    for (const o of TAP_OPTIONS) expect(text).toContain(o.label)
  })

  it('keeps her share switch on screen while she shares, even with every tap cleared', () => {
    const html = (state: LindaCase) =>
      renderToStaticMarkup(
        <LindaCaseContext.Provider value={{ state, update: () => {} }}>
          <MatchResult />
        </LindaCaseContext.Provider>,
      )
    expect(html(initialCase)).not.toContain('role="switch"')
    expect(html(tapped(['family']))).toContain('aria-checked="false"')
    expect(html(tapped([], { shared: true }))).toMatch(/role="switch" aria-checked="true"/)
  })
})

describe('tapping', () => {
  it('lets "None of these" clear her answers, and any answer clear it', () => {
    const answered = toggleTap(toggleTap(['private'], 'family'), 'secret')
    expect(toggleTap(answered, 'none')).toEqual(['none', 'private'])
    expect(toggleTap(['none', 'private'], 'other')).toEqual(['other', 'private'])
  })

  it('never turns "Something else" into a scam signal', () => {
    expect(TAP_OPTIONS.find((o) => o.id === 'other')?.kind).toBe('other')
  })
})

describe('the wire desk after the check', () => {
  const desk = (state: LindaCase) =>
    withCase(state, <TrickedCase member="M1001" stage="checked" now={storyTimes().match} />)
  const label = (id: TapId) => TAP_OPTIONS.find((o) => o.id === id)!.label

  it('learns nothing when she skips', () => {
    const text = desk(caseActions.finishCheck(initialCase))
    expect(text).toContain('Answers private')
    for (const o of TAP_OPTIONS) expect(text).not.toContain(o.label)
  })

  it('learns nothing from taps she has not shared', () => {
    const text = desk(tapped(['family', 'secret']))
    expect(text).toContain('Answers private')
    expect(text).not.toContain(label('family'))
    expect(text).not.toContain('grandparent')
  })

  it('sees shared taps, and a scam only when two or more fit it', () => {
    expect(desk(tapped(['family', 'secret'], { shared: true }))).toContain(
      '2 of her shared taps fit how the grandparent scam works.',
    )
    const other = desk(tapped(['other'], { shared: true }))
    expect(other).toContain(label('other'))
    expect(other).not.toContain('grandparent')
  })

  it('always sees a request to talk privately, and nothing else unshared', () => {
    const text = desk(tapped(['family', 'secret', 'private']))
    expect(text).toContain('Linda asked to talk privately.')
    expect(text).not.toContain(label('family'))
  })
})
