import { useSyncExternalStore } from 'react'

/**
 * What every window learns about Linda's drill: that she finished it, and whether she added a
 * trusted contact. Her answers and score stay in the drill's own screen and are never shared.
 * `run` is the demo run it belongs to and `v` counts edits within it.
 */
export type DrillState = { run: number; v: number; completed: boolean; trustedAdded: boolean }

export const initialDrill: DrillState = { run: 0, v: 0, completed: false, trustedAdded: false }

const isBlank = (s: DrillState) => !s.completed && !s.trustedAdded

export const drillActions = {
  complete: (s: DrillState): DrillState => (s.completed ? s : { ...s, completed: true }),
  /** A trusted contact is offered only at the drill's end, so adding one also completes it. */
  addTrusted: (s: DrillState): DrillState =>
    s.trustedAdded ? s : { ...s, completed: true, trustedAdded: true },
  reset: (s: DrillState): DrillState => (isBlank(s) ? s : { ...initialDrill, run: s.run, v: s.v }),
  /** A new demo run starts her over; a window still on an older run never clears a newer one. */
  forRun: (s: DrillState, run: number): DrillState =>
    run > s.run ? { ...initialDrill, run, v: s.v } : s,
}

/** The same winner whichever window runs it: the newer run, then more edits, then a fixed tie-break. */
export function mergeDrills(local: DrillState, incoming: DrillState): DrillState {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  if (local.v !== incoming.v) return local.v > incoming.v ? local : incoming
  return JSON.stringify(local) >= JSON.stringify(incoming) ? local : incoming
}

/** Keeps only the two facts any window may hold, whatever another window sent. */
export const project = (s: Partial<DrillState>): DrillState => ({
  run: typeof s.run === 'number' ? s.run : 0,
  v: typeof s.v === 'number' ? s.v : 0,
  completed: s.completed === true,
  trustedAdded: s.trustedAdded === true,
})

/** What staff see: the two statuses, nothing about how she answered. */
export const staffView = (s: DrillState) => ({ completed: s.completed, trustedAdded: s.trustedAdded })

/**
 * The drill's status lives outside React so Linda's phone, the staff screens and her later held
 * wire share it inside one window; one mounted <DrillSync /> per window keeps every window the same.
 */
let current: DrillState = initialDrill
const listeners = new Set<() => void>()

export const subscribeDrill = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const readDrill = () => current

export function writeDrill(next: DrillState) {
  if (next === current) return
  current = next
  for (const listener of listeners) listener()
}

export function updateDrill(change: (s: DrillState) => DrillState) {
  const next = change(current)
  if (next !== current) writeDrill({ ...next, v: current.v + 1 })
}

export const useDrill = () => useSyncExternalStore(subscribeDrill, readDrill, readDrill)

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
