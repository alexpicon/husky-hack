import { createContext, useContext } from 'react'
import { POLICY } from '../data/policy'
import type { ZoneTone } from '../story/engine'
import { clock } from '../ui/format'

/** Recovery, in order. Money is recovered only if the receiving bank returns it. */
export type ReportStage = 'received' | 'recall-requested' | 'recovered'

/** A member's "I think I've been scammed", filed at a moment of the story. */
export type Report = {
  member: string
  /** The story it was filed in; leaving that story closes the demo report. */
  story: string
  /** Story clock when it was filed, e.g. "Tue, Oct 6 · 12:55 PM". */
  clock: string
  stage: ReportStage
}

/** Shared by every window. `v` counts changes, so the most-changed copy wins. */
export type ReportState = { v: number; report: Report | null }

export const initialReport: ReportState = { v: 0, report: null }

/** Where the member is when they tap the link. */
export type ReportPlace = { member: string; story: string; clock: string }

const bump = (s: ReportState, report: Report | null): ReportState => ({ v: s.v + 1, report })

export const reportActions = {
  /** One tap files the report; tapping again shows the same case. */
  file: (s: ReportState, at: ReportPlace): ReportState =>
    s.report?.member === at.member ? s : bump(s, { ...at, stage: 'received' }),
  requestRecall: (s: ReportState): ReportState =>
    s.report?.stage === 'received' ? bump(s, { ...s.report, stage: 'recall-requested' }) : s,
  /** The demo moves on to another story. */
  leave: (s: ReportState, story: string): ReportState =>
    s.report?.story === story ? bump(s, null) : s,
}

/** The same winner whichever window runs it: more changes first, then a fixed tie-break. */
export function mergeReports(local: ReportState, incoming: ReportState): ReportState {
  if (local.v !== incoming.v) return local.v > incoming.v ? local : incoming
  return JSON.stringify(local) >= JSON.stringify(incoming) ? local : incoming
}

/** Who gets the link on a Sound app screen: everyone, or only a device the real member holds. */
export function reportLinkShown(
  zone: ZoneTone | null,
  rule: typeof POLICY.reportLink = POLICY.reportLink,
): boolean {
  return rule === 'everywhere' || zone === 'member'
}

const TIME = /(\d{1,2}):(\d{2}) (AM|PM)$/

/** The time of day at the end of a story clock, as a date on an arbitrary day. */
export function timeOfStoryClock(storyClock: string): Date {
  const m = TIME.exec(storyClock)
  if (!m) throw new Error(`Story clock without a time: "${storyClock}"`)
  const hours = (Number(m[1]) % 12) + (m[3] === 'PM' ? 12 : 0)
  const d = new Date(2000, 0, 1)
  d.setHours(hours, Number(m[2]))
  return d
}

/** "CASE-M1039-R1255": the member and the 24-hour time of the report. */
export function reportRef(r: Pick<Report, 'member' | 'clock'>): string {
  const t = timeOfStoryClock(r.clock)
  const hhmm = `${t.getHours()}`.padStart(2, '0') + `${t.getMinutes()}`.padStart(2, '0')
  return `CASE-${r.member}-R${hhmm}`
}

/** When the specialist's call is due. */
export function callbackBy(r: Pick<Report, 'clock'>, minutes: number): string {
  const t = timeOfStoryClock(r.clock)
  return clock(new Date(t.getTime() + minutes * 60_000))
}

/** What the member's report pauses, worded to match what a case holds under POLICY. */
export function pausedLine(ref: string, hold: typeof POLICY.caseHold = POLICY.caseHold): string {
  return hold === 'all'
    ? `We've paused outgoing payments and opened case ${ref}.`
    : `We've paused payments to new recipients and changes to your profile, and opened case ${ref}.`
}

/** The same pause, as staff read it on the case. */
export function staffPausedLine(hold: typeof POLICY.caseHold = POLICY.caseHold): string {
  return hold === 'all'
    ? 'Outgoing payments paused while this case is open.'
    : 'Payments to new recipients and profile changes paused while this case is open.'
}

type Api = {
  state: ReportState
  /** Where a tap would file the report; null outside a story. */
  place: ReportPlace | null
  file: () => void
  requestRecall: () => void
}

export const ReportContext = createContext<Api>({
  state: initialReport,
  place: null,
  file: () => {},
  requestRecall: () => {},
})

export const useReport = () => useContext(ReportContext)
