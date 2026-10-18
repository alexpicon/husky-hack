/**
 * "Real or AI?": the drill's logic only, no UI.
 *
 * Each round shows one pair: the same words, once in a real person's voice and once in an AI
 * voice, in random A/B order. The member plays both before answering. The answer comes from the
 * pair's own labels, never from a model, and nothing here listens to or analyzes anyone's voice.
 *
 * Every function returns a new game, so it drops into React state directly.
 */
import type { DrillPair } from './clips'

export type Label = 'real' | 'synthetic'

export type Clip = { label: Label; src: string }

export type Side = 'a' | 'b'

export type Round = {
  pair: DrillPair
  /** clips[0] plays as A, clips[1] as B. */
  clips: [Clip, Clip]
  heard: Side[]
  /** Sides whose recording could not load. They count as heard, so the round stays answerable. */
  missing: Side[]
  /** The side the member picked as AI, once she has answered. */
  guess: Side | null
  skipped: boolean
  /** 1-based round in this drill, for "Pair 2 of 3". */
  position: number
}

export type Score = { correct: number; total: number }

export type Game = {
  pairs: DrillPair[]
  deck: DrillPair[]
  next: number
  /** How many rounds this drill has. */
  rounds: number
  played: number
  /** Null once the drill is over, or when there is nothing to play. */
  round: Round | null
  score: Score
}

type Rng = () => number

export const SIDES: Side[] = ['a', 'b']

/** Fisher-Yates shuffle; returns a new array. */
export function shuffled<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Keeps only pairs with two different recordings. */
export const validPairs = (pairs: readonly DrillPair[]) =>
  pairs.filter((p) => p.real && p.fake && p.real !== p.fake)

/** Starts a drill: a shuffled deck and the first round. */
export function newGame(pairs: readonly DrillPair[], rounds: number, rng: Rng = Math.random): Game {
  const valid = validPairs(pairs)
  const game: Game = {
    pairs: valid,
    deck: shuffled(valid, rng),
    next: 0,
    rounds,
    played: 0,
    round: null,
    score: { correct: 0, total: 0 },
  }
  return nextRound(game, rng)
}

/**
 * Moves to the next pair, or ends the drill after its last round. Reshuffles when the deck runs
 * out, so pairs never repeat within a deck.
 */
export function nextRound(game: Game, rng: Rng = Math.random): Game {
  if (game.played >= game.rounds) return { ...game, round: null }
  let { deck, next } = game
  if (next >= deck.length) {
    deck = shuffled(game.pairs, rng)
    next = 0
  }
  const pair = deck[next]
  if (!pair) return { ...game, deck, next, round: null }
  const real: Clip = { label: 'real', src: pair.real }
  const fake: Clip = { label: 'synthetic', src: pair.fake }
  const clips = shuffled([real, fake], rng) as [Clip, Clip]
  const position = game.played + 1
  return {
    ...game,
    deck,
    next: next + 1,
    played: position,
    round: { pair, clips, heard: [], missing: [], guess: null, skipped: false, position },
  }
}

export const isOver = (game: Game) => game.round === null

const settled = (round: Round) => round.guess !== null || round.skipped

/** Records that a recording was played. Call it from the audio element's "play" event. */
export function markHeard(game: Game, side: Side): Game {
  const round = game.round
  if (!round || settled(round) || round.heard.includes(side)) return game
  return { ...game, round: { ...round, heard: [...round.heard, side] } }
}

/** Records that a recording could not load, so the member can still answer or skip. */
export function markMissing(game: Game, side: Side): Game {
  const round = game.round
  if (!round || settled(round) || round.missing.includes(side)) return game
  return { ...game, round: { ...round, missing: [...round.missing, side] } }
}

const ready = (round: Round, side: Side) => round.heard.includes(side) || round.missing.includes(side)

/** True once both recordings were played (or could not load) and no answer was given yet. */
export function canGuess(round: Round | null): boolean {
  return !!round && !settled(round) && SIDES.every((s) => ready(round, s))
}

export function clipOn(round: Round, side: Side): Clip {
  return round.clips[side === 'a' ? 0 : 1]
}

/** The member picks the side she thinks is AI. One answer per round. */
export function guess(game: Game, side: Side): Game {
  const round = game.round
  if (!round || !canGuess(round)) return game
  const won = clipOn(round, side).label === 'synthetic'
  return {
    ...game,
    round: { ...round, guess: side },
    score: { correct: game.score.correct + (won ? 1 : 0), total: game.score.total + 1 },
  }
}

/** Passes on a round without answering; it does not count toward the score. */
export function skip(game: Game): Game {
  const round = game.round
  if (!round || settled(round)) return game
  return { ...game, round: { ...round, skipped: true } }
}

/** True once she answered or skipped, so the next pair can start. */
export const roundDone = (round: Round | null) => !!round && settled(round)

/** Which side was AI, and whether she picked it. Null until she answers or skips. */
export function result(round: Round | null): { correct: boolean; syntheticSide: Side } | null {
  if (!round || !settled(round)) return null
  const syntheticSide: Side = round.clips[0].label === 'synthetic' ? 'a' : 'b'
  return { correct: round.guess === syntheticSide, syntheticSide }
}
