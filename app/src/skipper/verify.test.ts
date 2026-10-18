/** The code check on Skipper's suggestions: listed ids only, each backed by her own words. */
import { describe, expect, it } from 'vitest'
import { allowedIds } from './lists'
import { clampText, MAX_TEXT, normalize, quoted, verifySuggestions } from './verify'

const LINDA = allowedIds('linda')
const TEXT = 'My grandsons lawyer says he’s in JAIL, “dont tell anyone”!'

describe('normalize', () => {
  it('drops case, accents, punctuation and curly quotes', () => {
    expect(normalize('  He’s in JAIL,   “ok”! ')).toBe('hes in jail ok')
    expect(normalize('Está en la cárcel')).toBe('esta en la carcel')
    expect(normalize("don't")).toBe(normalize('dont'))
  })
})

describe('quoted', () => {
  it('finds whole words in a row, whatever the punctuation', () => {
    expect(quoted("don't tell anyone", TEXT)).toBe(true)
    expect(quoted('he’s in jail', TEXT)).toBe(true)
    expect(quoted('LAWYER', TEXT)).toBe(true)
  })

  it('refuses words she did not type, part words and empty quotes', () => {
    expect(quoted('lawyer called', TEXT)).toBe(false)
    expect(quoted('law', TEXT)).toBe(false)
    expect(quoted('ail', TEXT)).toBe(false)
    expect(quoted('', TEXT)).toBe(false)
    expect(quoted(' ,!', TEXT)).toBe(false)
  })
})

describe('verifySuggestions', () => {
  it('keeps listed ids whose quote is hers, in the list order', () => {
    const raw = [
      { id: 'secret', quote: '"dont tell anyone"' },
      { id: 'family', quote: 'grandsons' },
      { id: 'official', quote: 'lawyer' },
    ]
    expect(verifySuggestions(raw, LINDA, TEXT)).toEqual([
      { id: 'family', quote: 'grandsons' },
      { id: 'official', quote: 'lawyer' },
      { id: 'secret', quote: '"dont tell anyone"' },
    ])
  })

  it('drops ids off the list, all-clears included', () => {
    const raw = [
      { id: 'none', quote: 'lawyer' },
      { id: 'other', quote: 'lawyer' },
      { id: 'own', quote: 'lawyer' },
      { id: 'investment', quote: 'lawyer' },
    ]
    expect(verifySuggestions(raw, LINDA, TEXT)).toEqual([])
  })

  it('drops quotes she never typed', () => {
    expect(verifySuggestions([{ id: 'bail', quote: 'for bail' }], LINDA, TEXT)).toEqual([])
  })

  it('keeps the first of two suggestions for one tap', () => {
    const raw = [
      { id: 'family', quote: 'grandsons' },
      { id: 'family', quote: 'grandsons lawyer' },
    ]
    expect(verifySuggestions(raw, LINDA, TEXT)).toEqual([{ id: 'family', quote: 'grandsons' }])
  })

  it('ignores anything that is not a list of id and quote', () => {
    expect(verifySuggestions(null, LINDA, TEXT)).toEqual([])
    expect(verifySuggestions('family', LINDA, TEXT)).toEqual([])
    expect(verifySuggestions({ id: 'family', quote: 'grandsons' }, LINDA, TEXT)).toEqual([])
    expect(verifySuggestions([null, 3, { id: 'family' }, { id: 7, quote: 'lawyer' }], LINDA, TEXT)).toEqual([])
  })

  it('reads only the first 500 characters', () => {
    const long = `${'a '.repeat(MAX_TEXT / 2)} lawyer`
    expect(clampText(long).length).toBe(MAX_TEXT)
    expect(verifySuggestions([{ id: 'official', quote: 'lawyer' }], LINDA, long)).toEqual([])
  })

  it('refuses an overlong quote', () => {
    const text = `lawyer ${'x'.repeat(200)}`
    expect(verifySuggestions([{ id: 'official', quote: text }], LINDA, text)).toEqual([])
  })
})
