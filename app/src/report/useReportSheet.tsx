import { useState } from 'react'
import { useZoneTone } from '../story/engine'
import { reportLinkShown, useReport, type ReportChannel } from './report'
import { ReportSheet } from './ReportSheet'

/**
 * One tap files the report and opens the sheet that says what happens next. Render `sheet`
 * outside any positioned element inside the phone, so it covers the phone's screen.
 * `available` is false outside a story: with no member to file for, a link would do nothing.
 */
export function useReportSheet(channel: ReportChannel = 'app') {
  const { file, place } = useReport()
  const [open, setOpen] = useState(false)
  return {
    available: place !== null,
    open: () => {
      file(channel)
      setOpen(true)
    },
    sheet: open ? <ReportSheet onClose={() => setOpen(false)} /> : null,
  }
}

/**
 * The report sheet behind "I think I've been scammed" in a Sound app header, and whether this
 * screen shows the link: POLICY.reportLink decides from the zone, unless `show` overrides it.
 */
export function useReportLink(show?: boolean) {
  const zone = useZoneTone()
  const sheet = useReportSheet()
  return { ...sheet, shown: sheet.available && (show ?? reportLinkShown(zone)) }
}
