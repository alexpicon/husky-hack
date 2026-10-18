/** When her Skipper words leave a window, and that every window holding them settles on one copy. */
import { describe, expect, it } from 'vitest'
import { firstSeen, publishStep, type Now, type Seen } from './publish'
import { editWords, initialWords, mergeWords, sharedFor, type SharedWords, type SkipperStory } from './shareState'

const STORIES: SkipperStory[] = ['linda', 'michael']
const LIMIT = 50

/** One window: its copy of the shared words, what each member's hook last saw, and what it heard. */
type Win = { state: SharedWords; seen: Record<SkipperStory, Seen>; now: Record<SkipperStory, Now>; sent: number }

const quiet: Now = { shared: false, run: 0, round: 0, words: null }
const sharing = (words: string): Now => ({ ...quiet, shared: true, words })

const win = (): Win => ({
  state: initialWords,
  seen: { linda: firstSeen(false, 0), michael: firstSeen(false, 0) },
  now: { linda: quiet, michael: quiet },
  sent: 0,
})

/**
 * Runs both members' hooks as React does: each sees the copy of the same render, and each change
 * lands on the latest copy, which renders again. Returns how many renders it took to settle.
 */
function settle(w: Win): number {
  for (let renders = 1; renders <= LIMIT; renders++) {
    const state = w.state
    for (const story of STORIES) {
      const step = publishStep(story, w.seen[story], w.now[story], state)
      w.seen[story] = step.seen
      if (step.change) w.state = editWords(w.state, step.change)
      if (step.sent) w.sent += 1
    }
    if (w.state === state) return renders
  }
  return LIMIT
}

/** Both windows send their copy at once and merge the other's, until neither copy changes. */
function exchange(a: Win, b: Win): number {
  for (let trips = 1; trips <= LIMIT; trips++) {
    const before = JSON.stringify([a.state, b.state])
    const [fromA, fromB] = [a.state, b.state]
    a.state = mergeWords(a.state, fromB)
    b.state = mergeWords(b.state, fromA)
    settle(a)
    settle(b)
    if (JSON.stringify([a.state, b.state]) === before) return trips
  }
  return LIMIT
}

const words = (w: Win, story: SkipperStory) => sharedFor(w.state, story, 0, 0)?.words ?? null

describe('one window', () => {
  it('keeps both members words when Linda shares and then Michael does', () => {
    const w = win()
    w.now.linda = sharing('my grandson is in jail')
    expect(settle(w)).toBeLessThan(4)
    w.now.michael = sharing('we met online')
    expect(settle(w)).toBeLessThan(4)
    expect(words(w, 'linda')).toBe('my grandson is in jail')
    expect(words(w, 'michael')).toBe('we met online')
    expect(w.sent).toBe(2)
  })

  it('takes only her words back when she stops sharing', () => {
    const w = win()
    w.now.linda = sharing('my grandson is in jail')
    w.now.michael = sharing('we met online')
    settle(w)
    w.now.linda = { ...w.now.linda, shared: false }
    expect(settle(w)).toBeLessThan(4)
    expect(words(w, 'linda')).toBeNull()
    expect(words(w, 'michael')).toBe('we met online')
  })
})

describe('two windows that heard different words for her', () => {
  it.each([
    ['at once', true],
    ['one after the other', false],
  ])('settle on one copy after one send each, when she shares %s', (_, together) => {
    const a = win()
    const c = win()
    a.now.linda = sharing('AAAA my grandson is in jail')
    settle(a)
    if (!together) exchange(a, c)
    c.now.linda = sharing('CCCC my grandson needs bail')
    settle(c)
    expect(exchange(a, c)).toBeLessThan(4)
    expect(a.sent + c.sent).toBe(2)
    expect(words(a, 'linda')).toBe(words(c, 'linda'))
    expect(words(a, 'linda')).not.toBeNull()
  })

  it('still send new words typed in either window, and clear both when she stops sharing', () => {
    const a = win()
    const c = win()
    a.now.linda = sharing('AAAA my grandson is in jail')
    c.now.linda = sharing('CCCC my grandson needs bail')
    settle(a)
    settle(c)
    exchange(a, c)
    a.now.linda = sharing('AAAA his lawyer says keep it secret')
    settle(a)
    expect(exchange(a, c)).toBeLessThan(4)
    expect(words(c, 'linda')).toBe('AAAA his lawyer says keep it secret')
    a.now.linda = { ...a.now.linda, shared: false }
    c.now.linda = { ...c.now.linda, shared: false }
    settle(a)
    expect(exchange(a, c)).toBeLessThan(4)
    expect([words(a, 'linda'), words(c, 'linda')]).toEqual([null, null])
  })
})
