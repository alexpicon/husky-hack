import { events, eventsFor } from '../data/kit'
import { minutesBetween } from '../ui/format'

const p2p = (type: string) => events.filter((e) => e.type === type && e.rail === 'P2P').length

/** P2P recall requests in the kit, and how many the receiving bank refused. */
export const p2pRecalls = { requested: p2p('Recovery Request'), failed: p2p('Recovery Unsuccessful') }

/** Minutes from each scam report in the kit to the case Sound opened for it. */
export const reportToCaseMinutes = events
  .filter((e) => e.type === 'Scam Reported')
  .map((report) => {
    const opened = eventsFor(report.member).find((e) => e.type === 'Case Created' && e.at >= report.at)
    if (!opened) throw new Error(`${report.member}: a scam report with no case after it`)
    return minutesBetween(report.at, opened.at)
  })

/**
 * Minutes from a member's report to the specialist's call. Every report in the kit had a case
 * open within this time, so the promise rests on what Sound already does.
 */
export const CALLBACK_MINUTES = Math.max(...reportToCaseMinutes)
