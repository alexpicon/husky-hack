/** Every path through Linda's hold ends, both sides agree on the ending, and it stays final. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { TrickedCase } from '../staff/TrickedCase'
import { linda } from '../../story/linda'
import { clock } from '../../ui/format'
import { Decide } from './Decide'
import { MatchResult } from './MatchResult'
import { SilentCheck } from './SilentCheck'
import { lindaFacts, storyTimes } from './facts'
import {
  caseActions,
  initialCase,
  LindaCaseContext,
  type LindaCase,
  type OutcomeKind,
} from './lindaCase'
import { outcomeCopy, SEQUEL } from './outcomes'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look switch and case sync talk to other windows, which needs a browser.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const render = (state: LindaCase, node: ReactNode) =>
  renderToStaticMarkup(
    <LindaCaseContext.Provider value={{ state, update: () => {} }}>{node}</LindaCaseContext.Provider>,
  ).replace(/&#x27;/g, "'")

const t = storyTimes()
const ENDINGS: OutcomeKind[] = ['cancelled', 'sent', 'help', 'no-response']
const ended = (kind: OutcomeKind) =>
  caseActions.decide(
    caseActions.askToSend(initialCase),
    kind,
    kind === 'no-response' ? lindaFacts().holdEnds : t.decide,
    kind === 'sent' ? 'She still wants to send after we talked' : undefined,
  )

describe('the story', () => {
  it('opens on a calm-day drill, and ends with a step that shows how the wire ends', () => {
    expect(linda.steps.map((s) => s.id)).toEqual([
      'drill',
      'today',
      'silent-check',
      'match',
      'trusted',
      'outcome',
    ])
    expect(linda.sublabel).not.toMatch(/preview/i)
  })
})

describe.each(['concept', 'sound'] as const)("Linda's last screen (%s look)", (variant) => {
  beforeAll(() => {
    look.current = variant
  })

  it('offers cancel, help and talking to staff while the wire is paused', () => {
    const html = render(initialCase, <Decide at={t.decide} />)
    for (const choice of ['Cancel this wire', 'Help me check this', 'talk to staff']) {
      expect(html).toContain(choice)
    }
  })

  it('tells her when we will check back while the wire is paused, never as a countdown', () => {
    const update = `We'll check back by ${clock(lindaFacts().holdEnds)}`
    for (const screen of [
      <SilentCheck key="silent" />,
      <MatchResult key="match" />,
      <Decide key="decide" at={t.decide} />,
    ]) {
      const html = render(initialCase, screen)
      expect(html).toContain(update)
      expect(html).not.toMatch(/\d+\s*(h|hours?|min|minutes?)\s+(left|remaining)/i)
    }
  })

  it.each(ENDINGS)('ends "%s" with where the money is and the sequel line', (kind) => {
    const state = ended(kind)
    const html = render(state, <Decide at={t.decide} />)
    expect(html).toContain(outcomeCopy(state.outcome!).title)
    expect(html).toContain(SEQUEL)
    expect(html).not.toContain('Cancel this wire')
  })
})

describe('the wire desk', () => {
  const desk = (state: LindaCase) =>
    render(state, <TrickedCase member="M1001" stage="checked" now={t.decide} />)
  const releaseTag = (html: string) =>
    html.match(/<button[^>]*>(?:(?!<\/button>).)*?Release<\/span>/)?.[0].match(/<button[^>]*>/g)?.at(-1)
  const disabled = (tag?: string) => / disabled=""/.test(tag ?? '')

  it('can release while the wire is paused, and is asked for a reason', () => {
    const html = desk(caseActions.askToSend(initialCase))
    expect(releaseTag(html)).toBeDefined()
    expect(disabled(releaseTag(html))).toBe(false)
    expect(html).toContain('Asks for a reason')
    expect(html).toContain('Linda still wants to send.')
  })

  it.each(ENDINGS)('shows "%s" as final, with no way to release', (kind) => {
    const html = desk(ended(kind))
    expect(html).toContain(`${outcomeCopy(ended(kind).outcome!).status}. Final.`)
    expect(disabled(releaseTag(html))).toBe(true)
  })

  it('shows the hold deadline', () => {
    expect(desk(initialCase)).toContain(clock(lindaFacts().holdEnds))
  })

  it('records why a wire was released', () => {
    expect(desk(ended('sent'))).toContain('Reason: She still wants to send after we talked.')
  })
})
