/** Skipper on screen: its fixed wording, where it shows, and the staff note only once she shares. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { initialCase, LindaCaseContext, type LindaCase } from '../screens/linda/lindaCase'
import { initialCheck } from '../screens/michael/check'
import { writeCheck } from '../screens/michael/checkState'
import { MichaelCardSkipper } from './boxes'
import * as copy from './copy'
import { ReportSkipper } from './ReportSkipper'
import { initialWords, wordsActions, writeWords } from './shareState'
import { SkipperChat } from './SkipperChat'
import { LindaSkipperNote, MichaelSkipperNote } from './SkipperNote'

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const textOf = (node: ReactNode) =>
  renderToStaticMarkup(<>{node}</>)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .trim()

const withCase = (state: LindaCase, node: ReactNode) => (
  <LindaCaseContext.Provider value={{ state, update: () => {} }}>{node}</LindaCaseContext.Provider>
)

afterEach(() => {
  writeWords(initialWords)
  writeCheck(initialCheck)
})

describe("Skipper's wording", () => {
  const lines = Object.values(copy).flatMap((v) =>
    typeof v === 'string' ? [v] : typeof v === 'function' ? [] : Object.values(v as Record<string, string>),
  )

  it.each(lines)('never calls anything safe, verified or free of risk: %s', (line) => {
    expect(line).not.toMatch(/\bsafe\b|verified|no risk|[\u2013\u2014]/i)
  })

  it('tells her honestly where her words go in each mode', () => {
    expect(copy.privacyLine('keywords')).toBe(
      'Skipper matches your words to our list. Your words stay on this device unless you share them. If you share, Sound staff see your words.',
    )
    expect(copy.privacyLine('ai')).toBe(
      'Your typed words go to an AI provider to suggest taps. If you share, Sound staff see your words and a short summary.',
    )
    expect(copy.privacyLine('keywords', false)).not.toMatch(/share/)
  })
})

describe('the chat', () => {
  const chat = (startOpen: boolean) => (
    <SkipperChat
      screen="linda"
      look="concept"
      label="Tell Skipper what's happening"
      greeting="Hi Linda. Before this wire goes, what's going on? Type it your way."
      apply={() => {}}
      outcome={null}
      startOpen={startOpen}
    />
  )

  it('waits behind one button until she opens it', () => {
    const text = textOf(chat(false))
    expect(text).toContain("Tell Skipper what's happening")
    expect(text).not.toContain(copy.SKIPPER_TITLE)
  })

  it('opens with its name, the concept label, a fixed greeting, a text box and the keyword privacy line', () => {
    const html = renderToStaticMarkup(chat(true))
    const text = textOf(chat(true))
    expect(text).toContain(copy.SKIPPER_TITLE)
    expect(text).toContain(copy.CONCEPT)
    expect(text).toContain("Hi Linda. Before this wire goes, what's going on?")
    expect(text).toContain(copy.privacyLine('keywords'))
    expect(html).toContain('<textarea')
    expect(html).toMatch(/maxlength="500"/i)
    expect(text).not.toContain(copy.HEARD)
  })
})

describe('where Skipper shows', () => {
  it('leaves the card alone once Michael marks his own account', () => {
    expect(textOf(<MichaelCardSkipper look="sound" />)).toContain("Tell Skipper what's going on")
    writeCheck({ ...initialCheck, v: 1, taps: ['own'] })
    expect(textOf(<MichaelCardSkipper look="sound" />)).toBe('')
  })

  it('joins the report sheet for Michael and Sarah only', () => {
    expect(textOf(<ReportSkipper member="M1002" />)).toContain('Tell Skipper what happened')
    expect(textOf(<ReportSkipper member="M1003" />)).toContain('Tell Skipper what happened')
    expect(textOf(<ReportSkipper member="M1039" />)).toBe('')
    expect(textOf(<ReportSkipper member="M1001" />)).toBe('')
  })
})

describe("Skipper's note for staff", () => {
  const words = 'my grandsons lawyer says hes in jail dont tell anyone'
  const shared = (round = 0): LindaCase => ({ ...initialCase, round, shared: true })

  it('shows nothing until she shares', () => {
    writeWords(wordsActions.publish(initialWords, 'linda', 0, 0, words))
    expect(textOf(withCase({ ...initialCase }, <LindaSkipperNote />))).toBe('')
    expect(textOf(withCase(shared(), <LindaSkipperNote />))).toContain(`Her words: “${words}”`)
  })

  it('shows only her words when there is no note, and the note above them when there is', () => {
    writeWords(wordsActions.publish(initialWords, 'linda', 0, 0, words))
    const plain = textOf(withCase(shared(), <LindaSkipperNote />))
    expect(plain).toContain(copy.wordsTitle('Linda'))
    expect(plain).not.toContain(copy.NOTE_TITLE)
    const note = "Member says her grandson's lawyer called, he's in jail, and she was told not to tell anyone."
    writeWords(wordsActions.note(wordsActions.publish(initialWords, 'linda', 0, 0, words), 'linda', words, note))
    const noted = textOf(withCase(shared(), <LindaSkipperNote />))
    expect(noted).toContain(copy.NOTE_TITLE)
    expect(noted.indexOf(note)).toBeLessThan(noted.indexOf(`Her words: “${words}”`))
  })

  it('never shows words from another round or another member', () => {
    writeWords(wordsActions.publish(initialWords, 'linda', 0, 0, words))
    expect(textOf(withCase(shared(1), <LindaSkipperNote />))).toBe('')
    writeCheck({ ...initialCheck, v: 1, shared: true })
    expect(textOf(<MichaelSkipperNote />)).toBe('')
    writeWords(wordsActions.publish(initialWords, 'michael', 0, 0, 'we met online'))
    expect(textOf(<MichaelSkipperNote />)).toContain('His words: “we met online”')
  })
})
