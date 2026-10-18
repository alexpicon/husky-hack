import { useEffect, useState, useSyncExternalStore } from 'react'
import { useWindowSync } from '../../shell/sync'
import { checkActions, mergeChecks } from './check'
import { claimSync, leadsSync, readCheck, subscribeCheck, subscribeClaims, useMichaelCheck, writeCheck } from './checkState'

function Sync() {
  const state = useSyncExternalStore(subscribeCheck, readCheck, readCheck)
  useWindowSync('michael', state, (incoming) => {
    const local = readCheck()
    const merged = mergeChecks(local, incoming)
    // A fresh object re-sends this window's newer check to the one that sent a stale copy.
    writeCheck(merged === local ? { ...local } : merged)
  })
  return null
}

/** Both panes mount this; only one per window syncs, so a window never talks to itself. */
export function MichaelCheckSync() {
  const [id] = useState(() => Symbol('michael-sync'))
  useEffect(() => claimSync(id), [id])
  const lead = useSyncExternalStore(subscribeClaims, () => leadsSync(id), () => false)
  return lead ? <Sync /> : null
}

/** Starts a fresh check whenever the story shows the pattern card. */
export function ResetMichaelCheck() {
  const { update } = useMichaelCheck()
  useEffect(() => update(checkActions.reset), [update])
  return null
}
