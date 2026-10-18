import { useCallback, useSyncExternalStore } from 'react'
import type { TapAnswer } from './answers'

/** Yes, No or Not sure on the text, or "I lost that phone" in the app. */
export type M1039Answer = TapAnswer | 'lost-phone'

/**
 * M1039's answer, shared by every window. `run` is the demo run it belongs to and `v` counts
 * edits within it. `locked` is the staff lock after a No.
 */
export type AnswerState = { run: number; v: number; answer: M1039Answer | null; locked: boolean }

export const initialAnswer: AnswerState = { run: 0, v: 0, answer: null, locked: false }

export const isBlank = (s: AnswerState) => s.answer === null && !s.locked

export const answerActions = {
  /** The first answer is final; a later tap changes nothing. */
  give: (s: AnswerState, answer: M1039Answer): AnswerState => (s.answer === null ? { ...s, answer } : s),
  lock: (s: AnswerState): AnswerState => (s.answer === 'no' && !s.locked ? { ...s, locked: true } : s),
  reset: (s: AnswerState, run: number): AnswerState =>
    s.run === run && isBlank(s) ? s : { ...initialAnswer, run, v: s.v },
}

/** The same winner whichever window runs it: the newer run, then more edits, then a fixed tie-break. */
export function mergeAnswers(local: AnswerState, incoming: AnswerState): AnswerState {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  if (local.v !== incoming.v) return local.v > incoming.v ? local : incoming
  return JSON.stringify(local) >= JSON.stringify(incoming) ? local : incoming
}

/**
 * The answer lives outside React so the phone, the staff console and the narrator share it
 * inside one window; one mounted <M1039AnswerSync /> per window keeps every window the same.
 */
let current: AnswerState = initialAnswer
const listeners = new Set<() => void>()

export const subscribeAnswer = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const readAnswer = () => current

export function writeAnswer(next: AnswerState) {
  if (next === current) return
  current = next
  for (const listener of listeners) listener()
}

export function updateAnswer(change: (s: AnswerState) => AnswerState) {
  const next = change(current)
  if (next !== current) writeAnswer({ ...next, v: current.v + 1 })
}

export function useM1039Answer() {
  const state = useSyncExternalStore(subscribeAnswer, readAnswer, readAnswer)
  const give = useCallback((answer: M1039Answer) => updateAnswer((s) => answerActions.give(s, answer)), [])
  const lock = useCallback(() => updateAnswer(answerActions.lock), [])
  return { answer: state.answer, locked: state.locked, give, lock }
}

/** Every mounted sync in this window, oldest first; only the oldest talks to other windows. */
const claims: symbol[] = []
const claimListeners = new Set<() => void>()

export const subscribeClaims = (listener: () => void) => {
  claimListeners.add(listener)
  return () => {
    claimListeners.delete(listener)
  }
}

export function claimSync(id: symbol) {
  claims.push(id)
  for (const listener of claimListeners) listener()
  return () => {
    claims.splice(claims.indexOf(id), 1)
    for (const listener of claimListeners) listener()
  }
}

export const leadsSync = (id: symbol) => claims[0] === id
