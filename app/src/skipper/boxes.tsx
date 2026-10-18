import { useEffect } from 'react'
import { useReportSheet } from '../report/useReportSheet'
import { LINDA_NAME } from '../screens/linda/facts'
import { caseActions, useLindaCase } from '../screens/linda/lindaCase'
import { nameScam } from '../screens/linda/scams'
import type { TapId } from '../screens/linda/taps'
import { MICHAEL_NAME } from '../screens/michael/facts'
import { useRun } from '../shell/run'
import type { Look } from '../ui/look'
import { APPLIED, namedLine, PRIVATE_LINE } from './copy'
import { forget, hear } from './shareState'
import { SkipperChat, type Outcome } from './SkipperChat'
import { useMichaelSkipper } from './useMichaelSkipper'

/** Linda's branch tablet: her words to Skipper, and the taps they fit, go into her silent check. */
export function LindaSkipper({ look }: { look: Look }) {
  const { state, update } = useLindaCase()
  const { run } = useRun()
  const named = nameScam(state.taps)
  const outcome: Outcome = state.taps.includes('private')
    ? { line: PRIVATE_LINE, talk: false }
    : named
      ? { line: namedLine(named.scam.name, named.scam.how), talk: true }
      : { line: APPLIED, talk: false }
  return (
    <SkipperChat
      key={`${run}:${state.round}`}
      screen="linda"
      look={look}
      label="Tell Skipper what's happening"
      greeting={`Hi ${LINDA_NAME}. Before this wire goes, what's going on? Type it your way.`}
      apply={(ids) => update((c) => caseActions.addTaps(c, ids as TapId[]))}
      outcome={outcome}
      onTalk={() => update((c) => caseActions.addTaps(c, ['private']))}
      onHeard={(words) => hear('linda', run, state.round, words)}
    />
  )
}

/** Michael's pattern card. "Talk to a person" opens Sound's case and callback. */
export function MichaelCardSkipper({ look }: { look: Look }) {
  const m = useMichaelSkipper(false)
  const report = useReportSheet()
  // The card starts his check over, so words from an earlier visit are not his answer now.
  useEffect(() => forget('michael'), [])
  if (m.own) return null
  return (
    <>
      <SkipperChat
        screen="michael"
        look={look}
        label="Tell Skipper what's going on"
        greeting={`Hi ${MICHAEL_NAME}. Before this payment goes, what's going on? Type it your way.`}
        apply={m.apply}
        outcome={m.outcome}
        onTalk={report.available ? report.open : undefined}
        onHeard={m.onHeard}
      />
      {report.sheet}
    </>
  )
}
