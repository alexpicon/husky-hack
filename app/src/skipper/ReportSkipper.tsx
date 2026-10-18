import { MICHAEL, MICHAEL_NAME } from '../screens/michael/facts'
import { SARAH, SARAH_NAME } from '../screens/sarah/facts'
import { SARAH_LINE } from './copy'
import { SkipperChat } from './SkipperChat'
import { useMichaelSkipper } from './useMichaelSkipper'

function MichaelReportSkipper() {
  const m = useMichaelSkipper(true)
  return (
    <SkipperChat
      screen="michael"
      look="concept"
      label="Tell Skipper what happened"
      greeting={`Hi ${MICHAEL_NAME}. Tell me what happened, in your own words.`}
      apply={m.apply}
      outcome={m.outcome}
      onHeard={m.onHeard}
    />
  )
}

/** Sarah has no silent check, so Skipper only listens: her taps go nowhere and nothing is shared. */
function SarahReportSkipper() {
  return (
    <SkipperChat
      screen="sarah"
      look="concept"
      label="Tell Skipper what happened"
      greeting={`Hi ${SARAH_NAME}. Tell me what happened, in your own words.`}
      apply={() => {}}
      outcome={{ line: SARAH_LINE, talk: false }}
      shares={false}
    />
  )
}

/** Skipper in "I think I've been scammed", for the members it serves there. */
export function ReportSkipper({ member }: { member: string }) {
  if (member !== MICHAEL && member !== SARAH) return null
  return <div className="mt-3">{member === MICHAEL ? <MichaelReportSkipper /> : <SarahReportSkipper />}</div>
}
