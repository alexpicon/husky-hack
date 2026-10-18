import { initialReport, mergeReports, type ReportState } from './report'

/** The shared report, tagged with the demo run it was filed in. */
export type RunReport = ReportState & { run: number }

export const freshReport = (run: number): RunReport => ({ ...initialReport, run })

/** A later run's report replaces an earlier one's; within a run the usual merge picks. */
export function mergeRunReports(local: RunReport, incoming: RunReport): RunReport {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  return mergeReports(local, incoming) === local ? local : incoming
}

/** One of `reportActions`, applied without losing the run the report belongs to. */
export function inRun(s: RunReport, action: (s: ReportState) => ReportState): RunReport {
  const next = action(s)
  return next === s ? s : { ...next, run: s.run }
}

/** Clears a report from an earlier run; a report from this run or a later one stays. */
export const startRun = (s: RunReport, run: number): RunReport => (s.run < run ? freshReport(run) : s)
