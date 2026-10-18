import { useState } from 'react'
import { useReport } from './report'
import { ReportSheet } from './ReportSheet'

/**
 * One tap files the report and opens the sheet that says what happens next. Render `sheet`
 * outside any positioned element inside the phone, so it covers the phone's screen.
 * `available` is false outside a story: with no member to file for, a link would do nothing.
 */
export function useReportSheet() {
  const { file, place } = useReport()
  const [open, setOpen] = useState(false)
  return {
    available: place !== null,
    open: () => {
      file()
      setOpen(true)
    },
    sheet: open ? <ReportSheet onClose={() => setOpen(false)} /> : null,
  }
}
