import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useWindowSync } from './sync'

type RunApi = { run: number; newRun: () => void }

const RunContext = createContext<RunApi>({ run: 0, newRun: () => {} })

/**
 * A demo run number shared by every window in a session. Each story's answers
 * belong to one run, so "New run" clears rehearsal answers everywhere at once.
 */
export function RunProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(0)
  useWindowSync('run', run, setRun)
  // The click's time, so a window that has not yet heard of the latest run still starts a later one.
  const newRun = () => setRun((r) => Math.max(r + 1, Date.now()))
  return <RunContext.Provider value={{ run, newRun }}>{children}</RunContext.Provider>
}

export const useRun = () => useContext(RunContext)

/**
 * Clears a store whose answers belong to an earlier run. The store tags its state with its run
 * and keeps the later run's copy when it merges, so a window that joins mid-run (and so hears the
 * run number change) takes the run's answers instead of wiping them for everyone.
 */
export function useRunReset(stateRun: number, reset: (run: number) => void) {
  const { run } = useRun()
  useEffect(() => {
    if (stateRun < run) reset(run)
  }, [stateRun, run, reset])
}
