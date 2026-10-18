import { checkActions, romanceFit, type MichaelTap } from '../screens/michael/check'
import { useMichaelCheck } from '../screens/michael/checkState'
import { useRun } from '../shell/run'
import { APPLIED, APPLIED_SHEET, ROMANCE_NAMED } from './copy'
import { hear } from './shareState'
import type { Outcome } from './SkipperChat'

/** Skipper on Michael's check: confirmed taps go into it, and its own rule decides what is said. */
export function useMichaelSkipper(sheet: boolean) {
  const { state, update } = useMichaelCheck()
  const { run } = useRun()
  const fit = romanceFit(state.taps)
  const outcome: Outcome = fit ? { line: ROMANCE_NAMED, talk: !sheet } : { line: sheet ? APPLIED_SHEET : APPLIED, talk: false }
  return {
    own: state.taps.includes('own'),
    apply: (ids: string[]) => update((c) => checkActions.addTaps(c, ids as MichaelTap[])),
    outcome,
    onHeard: (words: string) => hear('michael', run, 0, words),
  }
}
