import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRunReset } from '../shell/run'
import { useWindowSync } from '../shell/sync'
import { ReportContext, reportActions, type ReportChannel, type ReportState } from './report'
import { freshReport, inRun, mergeRunReports, startRun } from './reportRun'

type Props = {
  /** The story on screen; a report closes when the demo leaves the story it was filed in. */
  story: string
  /** The member that story follows, and its clock, or null where there is no one to report for. */
  member: string | null
  clock: string | null
  children: ReactNode
}

/** Keeps the member's report the same in every window, on every laptop in a shared session. */
export function ReportProvider({ story, member, clock, children }: Props) {
  const [state, setState] = useState(() => freshReport(0))
  useWindowSync('report', state, (incoming) =>
    setState((local) => {
      // A report saved before demo runs existed has no run.
      const merged = mergeRunReports(local, { ...freshReport(0), ...incoming })
      // A fresh object re-sends this window's newer report to the one that sent a stale copy.
      return merged === local ? { ...local } : merged
    }),
  )
  const toRun = useCallback((run: number) => setState((s) => startRun(s, run)), [])
  useRunReset(state.run, toRun)

  const shown = useRef(story)
  useEffect(() => {
    const left = shown.current
    shown.current = story
    if (left !== story) setState((s) => inRun(s, (r) => reportActions.leave(r, left)))
  }, [story])

  const change = useCallback(
    (action: (s: ReportState) => ReportState) => setState((s) => inRun(s, action)),
    [],
  )
  const api = useMemo(() => {
    const place = member && clock ? { member, story, clock } : null
    return {
      state,
      place,
      file: (channel?: ReportChannel) => {
        if (place) change((s) => reportActions.file(s, place, channel))
      },
      requestRecall: () => change(reportActions.requestRecall),
    }
  }, [state, story, member, clock, change])
  return <ReportContext.Provider value={api}>{children}</ReportContext.Provider>
}
