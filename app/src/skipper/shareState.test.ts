/** The words staff may see: filled only by a publish, emptied by clear and a new run, kept apart per member, run and round. */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  editWords,
  forget,
  hear,
  heardWords,
  initialWords,
  mergeWords,
  sharedFor,
  wordsActions as act,
  type SharedWords,
} from './shareState'

const published = act.publish(initialWords, 'linda', 2, 3, '  my grandsons lawyer says dont tell anyone ')
const WORDS = 'my grandsons lawyer says dont tell anyone'

describe('the shared copy', () => {
  it('holds her words, cut to 500 characters, with no note yet', () => {
    expect(published).toMatchObject({ run: 2, linda: { round: 3, words: WORDS, note: null } })
    expect(act.publish(initialWords, 'michael', 1, 0, 'x'.repeat(900)).michael.words).toHaveLength(500)
  })

  it("keeps each member's words apart", () => {
    const both = act.publish(published, 'michael', 2, 0, 'we met online')
    expect(both.linda).toBe(published.linda)
    expect(act.clear(both, 'michael').linda).toBe(published.linda)
    expect(act.clear(both, 'linda').michael).toBe(both.michael)
    expect(sharedFor(both, 'michael', 2, 0)?.words).toBe('we met online')
    expect(sharedFor(both, 'linda', 2, 3)?.words).toBe(WORDS)
  })

  it('shows words only for their run and round', () => {
    expect(sharedFor(published, 'linda', 2, 4)).toBeNull()
    expect(sharedFor(published, 'linda', 3, 3)).toBeNull()
    expect(sharedFor(published, 'michael', 2, 3)).toBeNull()
  })

  it('takes words from a later run over the old ones, and none from an older run', () => {
    expect(act.publish(published, 'michael', 1, 0, 'we met online')).toBe(published)
    expect(act.publish(published, 'michael', 5, 0, 'we met online')).toMatchObject({
      run: 5,
      linda: { words: '' },
      michael: { words: 'we met online' },
    })
  })

  it('takes a note only for the words it was drafted from', () => {
    const noted = act.note(published, 'linda', WORDS, 'Member says her grandson’s lawyer called.')
    expect(noted.linda.note).toBe('Member says her grandson’s lawyer called.')
    expect(act.note(published, 'linda', 'other words', 'Member says hi.')).toBe(published)
    expect(act.note(published, 'michael', WORDS, 'Member says hi.')).toBe(published)
  })

  it('empties on clear and on a later run, keeping the run', () => {
    expect(act.clear(published, 'linda')).toEqual({ ...initialWords, run: 2 })
    expect(act.clear(initialWords, 'linda')).toBe(initialWords)
    expect(act.forRun(published, 5)).toEqual({ ...initialWords, run: 5 })
    expect(act.forRun(published, 2)).toBe(published)
    expect(act.forRun(published, 1)).toBe(published)
  })

  it('counts each change against the member it changed', () => {
    const once = editWords(initialWords, (s) => act.publish(s, 'linda', 0, 0, 'hi'))
    expect([once.linda.v, once.michael.v]).toEqual([1, 0])
    expect(editWords(once, (s) => act.note(s, 'michael', 'hi', 'Member says hi.'))).toBe(once)
    expect(editWords(once, (s) => act.clear(s, 'linda')).linda).toEqual({ ...initialWords.linda, v: 2 })
  })

  it('merges to the same copy whichever window runs it, member by member', () => {
    const at = (s: SharedWords, v: number): SharedWords => ({ ...s, linda: { ...s.linda, v } })
    const older = at({ ...published, run: 1 }, 9)
    const newer = at(published, 4)
    expect(mergeWords(older, newer)).toBe(newer)
    expect(mergeWords(newer, older)).toBe(newer)
    const edited = { ...newer, linda: { ...newer.linda, v: 5, note: 'Member says hi.' } }
    expect(mergeWords(newer, edited)).toBe(edited)
    expect(mergeWords(edited, newer)).toBe(edited)
    const his = editWords(newer, (s) => act.publish(s, 'michael', 2, 0, 'we met online'))
    const both = mergeWords(edited, his)
    expect(mergeWords(his, edited)).toEqual(both)
    expect(both).toMatchObject({ linda: { note: 'Member says hi.' }, michael: { words: 'we met online' } })
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
