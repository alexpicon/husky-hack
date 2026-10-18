import { useSyncExternalStore } from 'react'
import { initialAnswers, mergeAnswers, type JamesAnswers } from './answers'

/**
 * James's answers live outside React so his tablet and the teller desk share them inside one
 * window; one mounted <JamesSync /> per window keeps every window the same.
 */
let current: JamesAnswers = initialAnswers
const listeners = new Set<() => void>()

export const subscribeAnswers = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const readAnswers = () => current

export function writeAnswers(next: JamesAnswers) {
  if (next === current) return
  current = next
  for (const listener of listeners) listener()
}

/** One edit in this window; it counts toward which copy wins. */
export function changeAnswers(change: (a: JamesAnswers) => JamesAnswers) {
  const next = change(current)
  if (next !== current) writeAnswers({ ...next, v: current.v + 1 })
}

/** Another window's copy arrived: keep the winner. */
export function receiveAnswers(incoming: JamesAnswers) {
  const merged = mergeAnswers(current, incoming)
  // A fresh object re-sends this window's newer copy to the one that sent a stale one.
  writeAnswers(merged === current ? { ...current } : merged)
}

/** A new demo run starts empty; a copy from an earlier run never comes back. */
export function startRun(run: number) {
  if (run > current.run) writeAnswers({ ...initialAnswers, run })
}

export function useJamesAnswers() {
  const state = useSyncExternalStore(subscribeAnswers, readAnswers, readAnswers)
  return { state, update: changeAnswers }
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
