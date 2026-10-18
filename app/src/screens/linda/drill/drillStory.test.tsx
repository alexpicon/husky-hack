/** The drill in Linda's story: her calm-day first step, what staff may see, and the lesson on her held wire. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { linda } from '../../../story/linda'
import { TrickedCase } from '../../staff/TrickedCase'
import { storyTimes } from '../facts'
import { SilentCheck } from '../SilentCheck'
import { TRUSTED_RECENT_DAYS } from '../TrustedRules'
import { DRILL_TITLE, OPT_IN, REMINDER } from './copy'
import { DrillMemberCard, GUESSES_PRIVATE } from './DrillStaff'
import { drillActions, initialDrill, updateDrill, writeDrill } from './drillState'
import { drillDay } from './when'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look switch syncs across windows, which needs a browser; these tests pick the look.
vi.mock('../../../ui/look', () => ({ useLook: () => look.current }))

const textOf = (node: ReactNode) =>
  renderToStaticMarkup(<>{node}</>)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')

const DAY_MS = 24 * 60 * 60 * 1000
const drillStep = linda.steps[0]

beforeEach(() => {
  look.current = 'concept'
})
afterEach(() => writeDrill(initialDrill))

describe("Linda's first step", () => {
  it('is the drill, on a calm day five weeks before her wire, ahead of the held wire', () => {
    expect(linda.steps.map((s) => s.id).slice(0, 2)).toEqual(['drill', 'today'])
    expect(drillStep.title).toBe('Five weeks earlier, on a calm day')
    expect(storyTimes().caught.getTime() - drillDay().getTime()).toBe(35 * DAY_MS)
    expect(drillStep.caption).toMatch(/^A concept, not a kit event/)
  })

  it('comes early enough that a contact she adds there is past the rule that skips recent ones', () => {
    expect(storyTimes().trusted.getTime() - drillDay().getTime()).toBeGreaterThan(TRUSTED_RECENT_DAYS * DAY_MS)
    expect(textOf(linda.steps.find((s) => s.id === 'trusted')!.member)).toContain(`added in the last ${TRUSTED_RECENT_DAYS} days`)
  })

  it.each(['concept', 'sound'] as const)("shows the opt-in on Linda's phone, labeled a concept (%s look)", (variant) => {
    look.current = variant
    const text = textOf(drillStep.member)
    expect(text).toContain('Concept: the kit has no drill.')
    expect(text).toContain(DRILL_TITLE)
    expect(text).toContain(OPT_IN)
    expect(text).not.toContain("I think I've been scammed")
  })

  it('shows staff the member card with no drill yet', () => {
    const text = textOf(drillStep.staff)
    expect(text).toContain('No drill yet')
    expect(text).toContain(GUESSES_PRIVATE)
  })
})

describe('what staff see', () => {
  const card = () => textOf(<DrillMemberCard now={drillDay()} />)

  it('shows only that she finished, and a trusted contact if she added one', () => {
    updateDrill(drillActions.complete)
    expect(card()).toContain('Drill completed')
    expect(card()).not.toContain('Trusted contact added')
    updateDrill(drillActions.addTrusted)
    expect(card()).toContain('Trusted contact added')
    expect(card()).not.toContain('No drill yet')
  })

  it('never shows a score or her answers', () => {
    updateDrill(drillActions.addTrusted)
    expect(card()).not.toMatch(/You got|of 3|correct|Recording [AB]|picked/)
  })

  it('carries the two statuses onto her later wire case, and nothing before she does the drill', () => {
    const desk = () => textOf(<TrickedCase member="M1001" stage="held" now={storyTimes().check} />)
    expect(desk()).not.toContain('Drill completed')
    updateDrill(drillActions.addTrusted)
    expect(desk()).toContain('Drill completed')
    expect(desk()).toContain('Trusted contact added')
    expect(desk()).toContain(GUESSES_PRIVATE)
  })
})

describe.each(['concept', 'sound'] as const)('the held wire (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
  })

  it('leads with the drill once she has done it', () => {
    updateDrill(drillActions.complete)
    const text = textOf(<SilentCheck />)
    expect(text).toContain(REMINDER)
    expect(text.indexOf(REMINDER)).toBeLessThan(text.indexOf('This would be your'))
  })

  it('says nothing about a drill she never did', () => {
    expect(textOf(<SilentCheck />)).not.toContain('Remember your drill')
  })
})
