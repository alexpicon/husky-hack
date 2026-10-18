import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRun } from '../../../shell/run'
import { useWindowSync } from '../../../shell/sync'
import {
  claimSync,
  drillActions,
  leadsSync,
  mergeDrills,
  project,
  readDrill,
  subscribeClaims,
  subscribeDrill,
  updateDrill,
  writeDrill,
} from './drillState'

function Sync() {
  const state = useSyncExternalStore(subscribeDrill, readDrill, readDrill)
  const { run } = useRun()
  useEffect(() => updateDrill((s) => drillActions.forRun(s, run)), [run])
  useWindowSync('drill', state, (incoming) => {
    const local = readDrill()
    const merged = mergeDrills(local, project(incoming))
    // A fresh object re-sends this window's newer status to the one that sent a stale copy.
    writeDrill(merged === local ? { ...local } : merged)
  })
  return null
}

/** Every pane that reads the drill's status mounts this; only one per window syncs. */
export function DrillSync() {
  const [id] = useState(() => Symbol('drill-sync'))
  useEffect(() => claimSync(id), [id])
  const lead = useSyncExternalStore(subscribeClaims, () => leadsSync(id), () => false)
  return lead ? <Sync /> : null
}

/** On the drill's own step: not done yet, in every window. */
export function ResetDrill() {
  useEffect(() => updateDrill(drillActions.reset), [])
  return <DrillSync />
}
