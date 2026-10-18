import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useWindowSync } from '../shell/sync'
import { initialReport, mergeReports, ReportContext, reportActions, type ReportState } from './report'

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
  const [state, setState] = useState(initialReport)
  useWindowSync('report', state, (incoming) =>
    setState((local) => {
      const merged = mergeReports(local, incoming)
      // A fresh object re-sends this window's newer report to the one that sent a stale copy.
      return merged === local ? { ...local } : merged
    }),
  )

  const shown = useRef(story)
  useEffect(() => {
    const left = shown.current
    shown.current = story
    if (left !== story) setState((s) => reportActions.leave(s, left))
  }, [story])

  const change = useCallback((action: (s: ReportState) => ReportState) => setState(action), [])
  const api = useMemo(() => {
    const place = member && clock ? { member, story, clock } : null
    return {
      state,
      place,
      file: () => {
        if (place) change((s) => reportActions.file(s, place))
      },
      requestRecall: () => change(reportActions.requestRecall),
    }
  }, [state, story, member, clock, change])
  return <ReportContext.Provider value={api}>{children}</ReportContext.Provider>
}
