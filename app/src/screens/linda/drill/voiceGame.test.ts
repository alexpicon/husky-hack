/** The drill's rules: play both first, one answer a round, no repeats, and copy that never praises. */
import { describe, expect, it } from 'vitest'
import { DRILL_PAIRS, DRILL_ROUNDS, type DrillPair } from './clips'
import { CAUTION, prompt, scoreText } from './copy'
import {
  canGuess,
  clipOn,
  guess,
  isOver,
  markHeard,
  markMissing,
  newGame,
  nextRound,
  result,
  roundDone,
  skip,
  validPairs,
  type Game,
  type Side,
} from './voiceGame'

const pair = (id: string): DrillPair => ({
  id,
  label: `Caller ${id}`,
  transcript: `Words for ${id}`,
  real: `/clips/${id}-real.mp3`,
  fake: `/clips/${id}-fake.mp3`,
})

const PAIRS = ['p1', 'p2', 'p3', 'p4', 'p5'].map(pair)

/** Seeded, so every run draws the same decks. */
function seeded(start = 42) {
  let seed = start
  return () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
}

const aiSide = (g: Game): Side => (clipOn(g.round!, 'a').label === 'synthetic' ? 'a' : 'b')
const realSide = (g: Game): Side => (aiSide(g) === 'a' ? 'b' : 'a')
const heardBoth = (g: Game) => markHeard(markHeard(g, 'a'), 'b')

const PRAISE = /good at|you got it|well done|great|nice work|expert|perfect|nailed|correct!/i

describe('the pairs', () => {
  it('keeps only pairs with two different recordings', () => {
    const broken = [{ ...pair('x'), fake: '' }, { ...pair('y'), fake: pair('y').real }]
    expect(validPairs([...PAIRS, ...broken]).map((p) => p.id)).toEqual(['p1', 'p2', 'p3', 'p4', 'p5'])
  })

  it('ships one pair per scam call, each with its words, for a 3-round drill', () => {
    expect(DRILL_ROUNDS).toBe(3)
    expect(validPairs(DRILL_PAIRS)).toHaveLength(DRILL_PAIRS.length)
    expect(DRILL_PAIRS.length).toBeGreaterThanOrEqual(DRILL_ROUNDS)
    for (const p of DRILL_PAIRS) expect(p.transcript).toBeTruthy()
  })
})

describe('a round', () => {
  it('locks the answer until both recordings are played', () => {
    let g = newGame(PAIRS, 3, seeded())
    expect(canGuess(g.round)).toBe(false)
    expect(guess(g, 'a')).toBe(g)
    g = markHeard(g, 'a')
    expect(canGuess(g.round)).toBe(false)
    expect(prompt(g.round)).toMatch(/Play both/)
    g = markHeard(g, 'b')
    expect(canGuess(g.round)).toBe(true)
    expect(prompt(g.round)).toMatch(/Which recording is AI/)
  })

  it('scores a right answer once and ignores a second answer', () => {
    let g = heardBoth(newGame(PAIRS, 3, seeded()))
    const side = aiSide(g)
    g = guess(g, side)
    expect(g.score).toEqual({ correct: 1, total: 1 })
    expect(result(g.round)).toEqual({ correct: true, syntheticSide: side })
    expect(guess(g, realSide(g))).toBe(g)
    expect(markHeard(g, 'a')).toBe(g)
  })

  it('counts a wrong answer without scoring it', () => {
    let g = heardBoth(newGame(PAIRS, 3, seeded()))
    g = guess(g, realSide(g))
    expect(g.score).toEqual({ correct: 0, total: 1 })
    expect(result(g.round)!.correct).toBe(false)
  })

  it('lets her answer or skip when a recording could not load', () => {
    let g = markMissing(newGame(PAIRS, 3, seeded()), 'b')
    expect(canGuess(g.round)).toBe(false)
    expect(prompt(g.round)).toMatch(/or skip this pair/)
    g = markHeard(g, 'a')
    expect(canGuess(g.round)).toBe(true)
    expect(prompt(g.round)).toMatch(/^Recording not added yet\./)
    const skipped = skip(g)
    expect(roundDone(skipped.round)).toBe(true)
    expect(skipped.score).toEqual({ correct: 0, total: 0 })
    expect(guess(skipped, 'a')).toBe(skipped)
  })
})

describe('the drill', () => {
  it('ends after its rounds', () => {
    let g = newGame(PAIRS, 3, seeded())
    for (let i = 1; i <= 3; i++) {
      expect(g.round!.position).toBe(i)
      g = nextRound(guess(heardBoth(g), 'a'), seeded(i))
    }
    expect(isOver(g)).toBe(true)
    expect(g.score.total).toBe(3)
  })

  it('never repeats a pair within a deck, and reshuffles when it runs out', () => {
    const rng = seeded()
    let g = newGame(PAIRS, 12, rng)
    const seen = new Set<string>()
    for (let i = 0; i < PAIRS.length; i++) {
      expect(seen.has(g.round!.pair.id)).toBe(false)
      seen.add(g.round!.pair.id)
      g = nextRound(g, rng)
    }
    expect(seen.size).toBe(PAIRS.length)
    expect(g.next).toBe(1)
    expect(g.round!.position).toBe(PAIRS.length + 1)
  })

  it('puts the AI voice on both sides across rounds', () => {
    const rng = seeded()
    let g = newGame(PAIRS, 40, rng)
    const sides = new Set<Side>()
    for (let i = 0; i < 30; i++) {
      sides.add(aiSide(g))
      g = nextRound(g, rng)
    }
    expect(sides).toEqual(new Set(['a', 'b']))
  })

  it('has nothing to play without pairs', () => {
    const g = newGame([], 3)
    expect(isOver(g)).toBe(true)
    expect(prompt(g.round)).toBe('No recordings are available right now.')
  })
})

describe('the words', () => {
  it('reveals with the caution, right or wrong, and never praises', () => {
    const start = heardBoth(newGame(PAIRS, 3, seeded()))
    const right = guess(start, aiSide(start))
    const wrong = guess(start, realSide(start))
    for (const g of [right, wrong, skip(start)]) {
      const line = prompt(g.round)
      expect(line).toContain(`Recording ${aiSide(g).toUpperCase()} is the AI voice.`)
      expect(line).toContain(CAUTION)
      expect(line).not.toMatch(PRAISE)
    }
    expect(prompt(wrong.round)).toContain(`You picked ${realSide(wrong).toUpperCase()}.`)
  })

  it('gives the score with the caution, and never a verdict on her', () => {
    expect(scoreText({ correct: 2, total: 3 })).toBe(`You got 2 of 3. ${CAUTION}`)
    expect(scoreText({ correct: 0, total: 0 })).toContain(CAUTION)
    for (let correct = 0; correct <= 3; correct++) {
      expect(scoreText({ correct, total: 3 })).not.toMatch(PRAISE)
    }
  })
})
