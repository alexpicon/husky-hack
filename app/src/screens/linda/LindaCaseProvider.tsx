import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRunReset } from '../../shell/run'
import { useWindowSync } from '../../shell/sync'
import {
  caseActions,
  initialCase,
  LindaCaseContext,
  outbound,
  receiveCase,
  useLindaCase,
  type LindaCase,
} from './lindaCase'

/**
 * Keeps Linda's case the same in every window, on every laptop in a shared session, except the
 * answers she hasn't shared: those stay in this window.
 */
export function LindaCaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialCase)
  const shared = useMemo(() => outbound(state), [state])
  useWindowSync('linda', shared, (incoming) =>
    setState((local) => {
      // A case saved before demo runs existed has no run.
      const merged = receiveCase(local, { ...initialCase, ...incoming })
      // A fresh object re-sends this window's newer case to the one that sent a stale copy.
      return merged === local ? { ...local } : merged
    }),
  )
  const update = useCallback(
    (change: (c: LindaCase) => LindaCase) =>
      setState((c) => {
        const next = change(c)
        if (next === c || next.round !== c.round) return next
        return { ...next, v: c.v + 1 }
      }),
    [],
  )
  const toRun = useCallback((run: number) => update((c) => caseActions.startRun(c, run)), [update])
  useRunReset(state.run, toRun)
  const api = useMemo(() => ({ state, update }), [state, update])
  return <LindaCaseContext.Provider value={api}>{children}</LindaCaseContext.Provider>
}

/** Starts a fresh case whenever the story shows Linda's first step. */
export function ResetLindaCase() {
  const { update } = useLindaCase()
  useEffect(() => update(caseActions.reset), [update])
  return null
}
