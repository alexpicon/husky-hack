/** The drill's screens: an opt-in start, a round, a reveal that never praises, the ending, and the panel's own page. */
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DrillPair } from './clips'
import { CAUTION, DRILL_SUBTITLE, DRILL_TITLE, LESSONS, NOT_ADDED, OPT_IN, scoreText } from './copy'
import { drillActions, initialDrill, updateDrill, writeDrill } from './drillState'
import { DrillEnding } from './DrillEnding'
import { DrillRound } from './DrillRound'
import { TrustedEnroll } from './TrustedEnroll'
import { VoiceDrill } from './VoiceDrill'
import { clipOn, guess, markHeard, markMissing, newGame, nextRound, type Game, type Side } from './voiceGame'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look switch syncs across windows, which needs a browser; these tests pick the look.
vi.mock('../../../ui/look', () => ({ useLook: () => look.current }))

const textOf = (node: ReactElement) =>
  renderToStaticMarkup(node)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')

const PAIRS: DrillPair[] = ['p1', 'p2', 'p3'].map((id) => ({
  id,
  label: `Speaker ${id}`,
  about: 'Public figure, from a research dataset',
  real: `/voice-check/clips/${id}-real.mp3`,
  fake: `/voice-check/clips/${id}-fake.mp3`,
  credit: `Synthetic clip of Speaker ${id}.`,
}))

const PRAISE = /good at|you got it|well done|great|nice work|expert|perfect|nailed|correct!/i
const noop = () => {}
const start = () => newGame(PAIRS, 3, () => 0)
const aiSide = (g: Game): Side => (clipOn(g.round!, 'a').label === 'synthetic' ? 'a' : 'b')
const heardBoth = (g: Game) => markHeard(markHeard(g, 'a'), 'b')
const round = (game: Game, sound = false) =>
  textOf(<DrillRound sound={sound} game={game} change={noop} onNext={noop} />)
const markupOf = (game: Game) =>
  renderToStaticMarkup(<DrillRound sound={false} game={game} change={noop} onNext={noop} />)

beforeEach(() => {
  look.current = 'concept'
})
afterEach(() => writeDrill(initialDrill))

describe.each(['concept', 'sound'] as const)('the start (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
  })

  it('asks first, and plays nothing until she chooses to try it', () => {
    const text = textOf(<VoiceDrill pairs={PAIRS} />)
    for (const words of [DRILL_TITLE, DRILL_SUBTITLE, OPT_IN, 'Try the drill', 'Not now']) {
      expect(text).toContain(words)
    }
    expect(text).toContain("Nothing here listens to you or checks anyone's voice.")
    expect(renderToStaticMarkup(<VoiceDrill pairs={PAIRS} />)).not.toContain('<audio')
  })

  it('waits for the bundled recordings to load before it starts', () => {
    const html = renderToStaticMarkup(<VoiceDrill />)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Loading recordings<\/button>/)
  })

  it('links the credits for the recordings and photos', () => {
    const html = renderToStaticMarkup(<VoiceDrill pairs={PAIRS} />)
    expect(html).toMatch(/href="[^"]*voice-check\/CREDITS\.md"/)
    expect(textOf(<VoiceDrill pairs={PAIRS} />)).toContain('Recordings and photos: credits')
  })
})

describe('a round', () => {
  it('shows who is speaking, both recordings, and locks the answer until both are played', () => {
    const text = round(start())
    expect(text).toContain('Pair 1 of 3')
    expect(text).toContain('Speaker p')
    expect(text).toContain('Public figure, from a research dataset')
    expect(text).toContain('Recording A')
    expect(text).toContain('Recording B')
    expect(text).toContain('Play both recordings to unlock your answer.')
    const html = markupOf(start())
    expect(html.match(/<audio/g)).toHaveLength(2)
    expect(html.match(/<button[^>]*disabled=""[^>]*>[AB] is AI<\/button>/g)).toHaveLength(2)
    expect(html).not.toMatch(/synthetic|Real voice/)
  })

  it('unlocks the answer once both are played', () => {
    const html = markupOf(heardBoth(start()))
    expect(html.match(/<button[^>]*disabled=""[^>]*>[AB] is AI<\/button>/g)).toBeNull()
    expect(html).toContain('Which recording is AI?')
  })

  it('shows the words under each play button when a pair has them', () => {
    const scripted = newGame([{ ...PAIRS[0], transcript: "Grandma, it's me." }], 1)
    expect(round(scripted).match(/"Grandma, it's me\."/g)).toHaveLength(2)
  })

  it('says a recording is not added yet, keeps the words, and offers to skip', () => {
    const scripted = newGame([{ ...PAIRS[0], transcript: "Grandma, it's me." }], 1)
    const text = round(markMissing(scripted, 'b'))
    expect(text).toContain(NOT_ADDED)
    expect(text).toContain(`"Grandma, it's me."`)
    expect(text).toContain('Skip this pair')
  })
})

describe('the reveal', () => {
  it.each([true, false])('labels the AI clip as synthetic and adds the caution (right: %s)', (right) => {
    const ready = heardBoth(start())
    const side = right ? aiSide(ready) : aiSide(ready) === 'a' ? 'b' : 'a'
    const text = round(guess(ready, side))
    expect(text).toContain(`Recording ${aiSide(ready).toUpperCase()} is the AI voice.`)
    expect(text).toContain(CAUTION)
    expect(text.match(/AI voice: synthetic/g)).toHaveLength(1)
    expect(text.match(/Real voice/g)).toHaveLength(1)
    expect(text).toContain(ready.round!.pair.credit!)
    expect(text).not.toMatch(PRAISE)
    expect(text).toContain('Next pair')
  })

  it('ends the last round with what to remember', () => {
    let g = start()
    g = nextRound(guess(heardBoth(g), 'a'))
    g = nextRound(guess(heardBoth(g), 'a'))
    expect(round(guess(heardBoth(g), 'a'))).toContain('See what to remember')
  })
})

describe('the ending', () => {
  const ending = (standalone: boolean) =>
    textOf(<DrillEnding sound={false} score={{ correct: 2, total: 3 }} standalone={standalone} onBack={noop} />)

  it('gives the score with the caution, the two habits, and a trusted contact to add or not', () => {
    const text = ending(false)
    expect(text).toContain(scoreText({ correct: 2, total: 3 }))
    expect(text).toContain("You got 2 of 3. Even when you're right, you can't be sure by ear.")
    for (const lesson of LESSONS) expect(text).toContain(lesson)
    expect(text).toContain('Add a trusted contact')
    expect(text).toContain('Not now')
    expect(text).toContain('Recordings and photos: credits')
    expect(text).not.toMatch(PRAISE)
  })

  it('says a trusted contact is informed only and removable, once she adds one', () => {
    updateDrill(drillActions.addTrusted)
    const text = textOf(<TrustedEnroll sound={false} />)
    expect(text).toContain('Trusted contact added')
    expect(text).toContain('They never see amounts or your account.')
    expect(text).toContain('You can remove them anytime.')
  })

  it('on its own page, ends with the two habits and Back, and no trusted contact', () => {
    const text = ending(true)
    for (const lesson of LESSONS) expect(text).toContain(lesson)
    expect(text).toContain('Back')
    expect(text).not.toContain('Add a trusted contact')
  })
})

describe('on its own page', () => {
  it('draws in the concept look in one narrow column, whatever the phone look', () => {
    look.current = 'sound'
    const html = renderToStaticMarkup(<VoiceDrill standalone pairs={PAIRS} />)
    expect(html).toContain('max-w-[440px]')
    expect(html).toContain('px-4')
    expect(html).not.toContain('linear-gradient')
  })

  it('keeps every button at least 44 px tall', () => {
    const html = renderToStaticMarkup(<VoiceDrill standalone pairs={PAIRS} />)
    for (const tag of html.match(/<button[^>]*>/g)!) expect(tag).toMatch(/\bh-12\b|\bmin-h-12\b/)
    const playing = markupOf(heardBoth(start()))
    for (const tag of playing.match(/<button[^>]*>/g)!) expect(tag).toMatch(/\bh-12\b|\bmin-h-12\b/)
  })
})
