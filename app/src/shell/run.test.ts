/** "New run": a later run clears Linda's case and the report everywhere, and a window that joins mid-run keeps them. */
import { describe, expect, it } from 'vitest'
import { reportActions } from '../report/report'
import { freshReport, inRun, mergeRunReports, startRun } from '../report/reportRun'
import { caseActions as act, initialCase, mergeCases, type LindaCase } from '../screens/linda/lindaCase'

/** A run number as "New run" makes it: the time of the click. */
const RUN = new Date(2026, 9, 18, 12, 55).getTime()
const at = new Date(2026, 9, 20, 14, 16)
const edit = (c: LindaCase, change: (c: LindaCase) => LindaCase) => ({ ...change(c), v: c.v + 1 })

describe("Linda's case on a new run", () => {
  const ended = edit(edit(act.tap(initialCase, 'family'), (c) => act.decide(c, 'cancelled', at)), (c) =>
    act.staff(c, 'case-opened'),
  )

  it('clears an ended rehearsal case', () => {
    const next = act.startRun(ended, RUN)
    expect(next).toEqual({ ...initialCase, run: RUN, round: ended.round + 1 })
  })

  it('wins over the ended case in every window, whichever copy arrives first', () => {
    const next = act.startRun(ended, RUN)
    expect(mergeCases(ended, next)).toBe(next)
    expect(mergeCases(next, ended)).toBe(next)
    const resetMoreOffline = { ...ended, round: next.round + 3 }
    expect(mergeCases(resetMoreOffline, next)).toBe(next)
  })

  it('keeps a case already in this run', () => {
    const tapped = edit(act.startRun(ended, RUN), (c) => act.tap(c, 'bail'))
    expect(act.startRun(tapped, RUN)).toBe(tapped)
  })

  it('keeps its run through the reset on the first step', () => {
    expect(act.reset(act.startRun(ended, RUN)).run).toBe(RUN)
  })

  it("lets a window that joins mid-run take the run's case instead of wiping it", () => {
    const played = edit(act.startRun(ended, RUN), (c) => act.decide(c, 'sent', at, 'She confirmed'))
    expect(mergeCases(initialCase, played)).toBe(played)
    const joinerHeardTheRunFirst = act.startRun(initialCase, RUN)
    expect(mergeCases(joinerHeardTheRunFirst, played)).toEqual(played)
    expect(mergeCases(played, joinerHeardTheRunFirst)).toEqual(played)
  })
})

describe('the report on a new run', () => {
  const place = { member: 'M1003', story: 'sarah', clock: 'Thu, Oct 15 · 10:22 PM' }
  const filed = inRun(freshReport(0), (s) => reportActions.file(s, place))

  it('clears a filed rehearsal report', () => {
    expect(filed.report?.stage).toBe('received')
    expect(startRun(filed, RUN)).toEqual(freshReport(RUN))
  })

  it('wins over the filed report in every window, whichever copy arrives first', () => {
    const next = startRun(filed, RUN)
    expect(mergeRunReports(filed, next)).toBe(next)
    expect(mergeRunReports(next, filed)).toBe(next)
  })

  it('keeps its run through every report action', () => {
    const played = inRun(freshReport(RUN), (s) => reportActions.file(s, place))
    expect(played.run).toBe(RUN)
    expect(inRun(played, reportActions.requestRecall)).toMatchObject({ run: RUN, report: { stage: 'recall-requested' } })
    expect(inRun(played, (s) => reportActions.leave(s, 'sarah'))).toMatchObject({ run: RUN, report: null })
    expect(startRun(played, RUN)).toBe(played)
  })

  it("lets a window that joins mid-run take the run's report instead of wiping it", () => {
    const played = inRun(freshReport(RUN), (s) => reportActions.file(s, place))
    expect(mergeRunReports(freshReport(0), played)).toBe(played)
    expect(mergeRunReports(startRun(freshReport(0), RUN), played)).toBe(played)
    expect(mergeRunReports(played, startRun(freshReport(0), RUN))).toBe(played)
  })
})
