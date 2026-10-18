import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRun } from '../../shell/run'
import { useWindowSync } from '../../shell/sync'
import { checkActions, initialCheck, mergeChecks, type MichaelCheck } from './check'
import { claimSync, leadsSync, readCheck, subscribeClaims, useMichaelCheck, writeCheck } from './checkState'

function Sync() {
  const { state, update } = useMichaelCheck()
  const { run } = useRun()
  useEffect(() => update((c) => checkActions.forRun(c, run)), [run, update])
  useWindowSync('michael', state, (sent: Partial<MichaelCheck>) => {
    const local = readCheck()
    // A copy saved before a field existed still merges, with that field at its start value.
    const merged = mergeChecks(local, { ...initialCheck, ...sent })
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
