/** The words staff may see: filled only by a publish, emptied by clear and a new run, and kept apart per run and round. */
import { beforeEach, describe, expect, it } from 'vitest'
import { forget, hear, heardWords, initialWords, mergeWords, wordsActions as act } from './shareState'

const published = act.publish(initialWords, 'linda', 2, 3, '  my grandsons lawyer says dont tell anyone ')

describe('the shared copy', () => {
  it('holds her words, cut to 500 characters, with no note yet', () => {
    expect(published).toMatchObject({ story: 'linda', run: 2, round: 3, words: 'my grandsons lawyer says dont tell anyone', note: null })
    expect(act.publish(initialWords, 'michael', 1, 0, 'x'.repeat(900)).words).toHaveLength(500)
  })

  it('takes a note only for the words it was drafted from', () => {
    const noted = act.note(published, 'linda', 'my grandsons lawyer says dont tell anyone', 'Member says her grandson’s lawyer called.')
    expect(noted.note).toBe('Member says her grandson’s lawyer called.')
    expect(act.note(published, 'linda', 'other words', 'Member says hi.')).toBe(published)
    expect(act.note(published, 'michael', published.words, 'Member says hi.')).toBe(published)
  })

  it('empties on clear and on a later run, keeping the run and the edit count', () => {
    const v = { ...published, v: 7 }
    expect(act.clear(v)).toEqual({ ...initialWords, run: 2, v: 7 })
    expect(act.clear(initialWords)).toBe(initialWords)
    expect(act.forRun(v, 5)).toEqual({ ...initialWords, run: 5, v: 7 })
    expect(act.forRun(v, 2)).toBe(v)
    expect(act.forRun(v, 1)).toBe(v)
  })

  it('merges to the same copy whichever window runs it', () => {
    const older = { ...published, run: 1, v: 9 }
    const newer = { ...published, v: 4 }
    expect(mergeWords(older, newer)).toBe(newer)
    expect(mergeWords(newer, older)).toBe(newer)
    const edited = { ...newer, v: 5, note: 'Member says hi.' }
    expect(mergeWords(newer, edited)).toBe(edited)
    expect(mergeWords(edited, newer)).toBe(edited)
  })
})

describe('her words in this window', () => {
  beforeEach(() => {
    forget('linda')
    forget('michael')
  })

  it('are kept for the run and round she typed them in', () => {
    hear('linda', 2, 3, '  lawyer says bail  ')
    expect(heardWords('linda', 2, 3)).toBe('lawyer says bail')
    expect(heardWords('linda', 2, 4)).toBeNull()
    expect(heardWords('linda', 3, 3)).toBeNull()
    expect(heardWords('michael', 2, 3)).toBeNull()
  })

  it('are gone once forgotten', () => {
    hear('michael', 1, 0, 'we met online')
    forget('michael')
    expect(heardWords('michael', 1, 0)).toBeNull()
  })
})
