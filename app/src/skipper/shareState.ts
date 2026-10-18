import { useCallback, useSyncExternalStore } from 'react'
import { clampText } from './verify'

export type SkipperStory = 'linda' | 'michael'

/**
 * One member's words to Skipper and Skipper's note, empty unless they share. `round` is Linda's
 * case round (0 for Michael), and `v` counts edits to this entry alone.
 */
export type SharedEntry = { v: number; round: number; words: string; note: string | null }

/**
 * What each member typed to Skipper, the one copy staff see. `run` is the demo run. Each member has
 * an entry of their own, so publishing one member's words never changes the other's.
 */
export type SharedWords = { run: number; linda: SharedEntry; michael: SharedEntry }

const emptyEntry: SharedEntry = { v: 0, round: 0, words: '', note: null }

export const initialWords: SharedWords = { run: 0, linda: emptyEntry, michael: emptyEntry }

/** A new demo run empties it; a window still on an older run never clears a newer one. */
const forRun = (s: SharedWords, run: number): SharedWords => (run > s.run ? { ...initialWords, run } : s)

export const wordsActions = {
  publish: (s: SharedWords, story: SkipperStory, run: number, round: number, words: string): SharedWords => {
    if (run < s.run) return s
    const fresh = forRun(s, run)
    return { ...fresh, [story]: { ...fresh[story], round, words: clampText(words), note: null } }
  },
  /** A note only ever goes with the words it was drafted from. */
  note: (s: SharedWords, story: SkipperStory, words: string, note: string): SharedWords => {
    const e = s[story]
    return e.words && e.words === clampText(words) && e.note !== note ? { ...s, [story]: { ...e, note } } : s
  },
  clear: (s: SharedWords, story: SkipperStory): SharedWords =>
    s[story].words || s[story].note ? { ...s, [story]: emptyEntry } : s,
  forRun,
}

/** Picks the same one of two copies of an entry whichever is passed first: more edits, then a fixed tie-break. */
function newerEntry(a: SharedEntry, b: SharedEntry): SharedEntry {
  if (a.v !== b.v) return a.v > b.v ? a : b
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b
}

/** The same copy whichever window runs it: the newer run, then each member's newer entry. */
export function mergeWords(local: SharedWords, incoming: SharedWords): SharedWords {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  const linda = newerEntry(local.linda, incoming.linda)
  const michael = newerEntry(local.michael, incoming.michael)
  if (linda === local.linda && michael === local.michael) return local
  if (linda === incoming.linda && michael === incoming.michael) return incoming
  return { run: local.run, linda, michael }
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

/** One change, as every window makes it: each member's entry it changes counts one more edit. */
export function editWords(s: SharedWords, change: (s: SharedWords) => SharedWords): SharedWords {
  const next = change(s)
  if (next === s) return s
  const counted = (story: SkipperStory) => (next[story] === s[story] ? next[story] : { ...next[story], v: s[story].v + 1 })
  return { ...next, linda: counted('linda'), michael: counted('michael') }
}

/** Her words and Skipper's note for this run and round, or null. */
export function sharedFor(s: SharedWords, story: SkipperStory, run: number, round: number): SharedEntry | null {
  const e = s[story]
  return s.run === run && e.round === round && e.words ? e : null
}

export function useSharedWords() {
  const state = useSyncExternalStore(subscribe, readWords, readWords)
  const update = useCallback((change: (s: SharedWords) => SharedWords) => writeWords(editWords(current, change)), [])
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
