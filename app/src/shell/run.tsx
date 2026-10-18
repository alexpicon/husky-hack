import { createContext, useContext, useState, type ReactNode } from 'react'
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
  return <RunContext.Provider value={{ run, newRun: () => setRun((r) => r + 1) }}>{children}</RunContext.Provider>
}

export const useRun = () => useContext(RunContext)
