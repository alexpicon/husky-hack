/** Where each story's opening line sits: on one step, Linda's on her bad day. */
import { describe, expect, it, vi } from 'vitest'
import { james } from './james'
import { linda } from './linda'
import { m1039 } from './m1039'
import { michael } from './michael'
import { OPENINGS, type StoryId } from './openings'
import { sarah } from './sarah'

// The real look switch syncs across windows, which needs a browser.
vi.mock('../ui/look', () => ({ useLook: () => 'concept' }))
vi.mock('../shell/sync', () => ({ useWindowSync: () => {} }))

const stories = [linda, sarah, m1039, michael, james]

describe('the opening line on each story', () => {
  it.each(stories.map((s) => [s.id, s] as const))('%s carries its line on exactly one step', (id, s) => {
    const withLine = s.steps.filter((step) => step.opening)
    expect(withLine).toHaveLength(1)
    expect(withLine[0].opening).toBe(OPENINGS[id as StoryId])
  })

  it("puts Linda's on the day of the wire", () => {
    expect(linda.steps.find((s) => s.opening)?.id).toBe('today')
  })

  it('is on the first step of every other story', () => {
    for (const s of [sarah, m1039, michael, james]) expect(s.steps[0].opening).toBeDefined()
  })
})
