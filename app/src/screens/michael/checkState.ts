import { useCallback, useSyncExternalStore } from 'react'
import { initialCheck, type MichaelCheck } from './check'

/**
 * Michael's check lives outside React so his phone and the staff console share it inside one
 * window; one mounted <MichaelCheckSync /> per window sends the others only what he shares.
 */
let current: MichaelCheck = initialCheck
const listeners = new Set<() => void>()

export const subscribeCheck = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const readCheck = () => current

export function writeCheck(next: MichaelCheck) {
  if (next === current) return
  current = next
  for (const listener of listeners) listener()
}

export function useMichaelCheck() {
  const state = useSyncExternalStore(subscribeCheck, readCheck, readCheck)
  const update = useCallback((change: (c: MichaelCheck) => MichaelCheck) => {
    const next = change(current)
    if (next !== current) writeCheck({ ...next, v: current.v + 1 })
  }, [])
  return { state, update }
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
