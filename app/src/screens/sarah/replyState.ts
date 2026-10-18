import { useCallback, useSyncExternalStore } from 'react'
import { useRun } from '../../shell/run'
import { initialReply, inRun, type SarahReply } from './reply'

/**
 * Sarah's reply lives outside React so her phone, the staff case and the scammer's screen share it
 * inside one window; one mounted <SarahReplySync /> per window keeps every window the same.
 */
let current: SarahReply = initialReply
const listeners = new Set<() => void>()

export const subscribeReply = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const readReply = () => current

export function writeReply(next: SarahReply) {
  if (next === current) return
  current = next
  for (const listener of listeners) listener()
}

/** Her reply in this demo run, and a way to change it that every window hears. */
export function useSarahReply() {
  const { run } = useRun()
  const stored = useSyncExternalStore(subscribeReply, readReply, readReply)
  const update = useCallback(
    (change: (r: SarahReply) => SarahReply) => {
      const base = inRun(current, run)
      const next = change(base)
      if (next !== base) writeReply({ ...next, v: current.v + 1 })
    },
    [run],
  )
  return { reply: inRun(stored, run), update }
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
