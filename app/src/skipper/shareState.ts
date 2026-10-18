import { useCallback, useSyncExternalStore } from 'react'
import { clampText } from './verify'

export type SkipperStory = 'linda' | 'michael'

/**
 * What she typed to Skipper and Skipper's note, the one copy staff see. It holds anything only
 * while she shares her answers. `run` is the demo run, `round` Linda's case round (0 for Michael),
 * and `v` counts edits: a newer run wins, then the newer copy.
 */
export type SharedWords = {
  run: number
  round: number
  v: number
  story: SkipperStory | null
  words: string
  note: string | null
}

export const initialWords: SharedWords = { run: 0, round: 0, v: 0, story: null, words: '', note: null }

export const wordsActions = {
  publish: (s: SharedWords, story: SkipperStory, run: number, round: number, words: string): SharedWords => ({
    ...s,
    story,
    run,
    round,
    words: clampText(words),
    note: null,
  }),
  /** A note only ever goes with the words it was drafted from. */
  note: (s: SharedWords, story: SkipperStory, words: string, note: string): SharedWords =>
    s.story === story && s.words === clampText(words) && s.note !== note ? { ...s, note } : s,
  clear: (s: SharedWords): SharedWords =>
    s.story === null && !s.words && !s.note ? s : { ...initialWords, run: s.run, v: s.v },
  /** A new demo run empties it; a window still on an older run never clears a newer one. */
  forRun: (s: SharedWords, run: number): SharedWords => (run > s.run ? { ...initialWords, run, v: s.v } : s),
}

/** The same winner whichever window runs it: the newer run, then more edits, then a fixed tie-break. */
export function mergeWords(local: SharedWords, incoming: SharedWords): SharedWords {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  if (local.v !== incoming.v) return local.v > incoming.v ? local : incoming
  return JSON.stringify(local) >= JSON.stringify(incoming) ? local : incoming
}

let current = initialWords
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const readWords = () => current

export function writeWords(next: SharedWords) {
  if (next === current) return
  current = next
  for (const listener of listeners) listener()
}

export function useSharedWords() {
  const state = useSyncExternalStore(subscribe, readWords, readWords)
  const update = useCallback((change: (s: SharedWords) => SharedWords) => {
    const next = change(current)
    if (next !== current) writeWords({ ...next, v: current.v + 1 })
  }, [])
  return { state, update }
}

/**
 * Her words in this window only, from the moment she sends them to Skipper. They leave this
 * window only through `wordsActions.publish`, once she shares.
 */
type Heard = { run: number; round: number; words: string }
let heard: Partial<Record<SkipperStory, Heard>> = {}
let heardVersion = 0
const heardListeners = new Set<() => void>()

export const subscribeHeard = (listener: () => void) => {
  heardListeners.add(listener)
  return () => {
    heardListeners.delete(listener)
  }
}

export const readHeardVersion = () => heardVersion

function changeHeard(next: Partial<Record<SkipperStory, Heard>>) {
  heard = next
  heardVersion += 1
  for (const listener of heardListeners) listener()
}

export const hear = (story: SkipperStory, run: number, round: number, words: string) =>
  changeHeard({ ...heard, [story]: { run, round, words: clampText(words) } })

export const forget = (story: SkipperStory) => {
  if (heard[story]) changeHeard({ ...heard, [story]: undefined })
}

/** Her words for this run and round, or null. */
export function heardWords(story: SkipperStory, run: number, round: number): string | null {
  const h = heard[story]
  return h && h.run === run && h.round === round && h.words ? h.words : null
}
