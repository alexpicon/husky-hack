import { MessageSquareText } from 'lucide-react'
import { LINDA_NAME } from '../screens/linda/facts'
import { useLindaCase } from '../screens/linda/lindaCase'
import { useMichaelCheck } from '../screens/michael/checkState'
import { MICHAEL_NAME } from '../screens/michael/facts'
import { Panel } from '../screens/staff/parts'
import { useRun } from '../shell/run'
import { NOTE_TITLE, wordsTitle } from './copy'
import { useSharedWords, type SkipperStory } from './shareState'

type Props = { story: SkipperStory; name: string; pronoun: 'Her' | 'His'; shared: boolean; round: number }

/**
 * What she typed to Skipper, on the staff case only once she shares. Skipper's note shows when
 * the AI drafted one that passed its check; her own words always show under it.
 */
function SkipperNote({ story, name, pronoun, shared, round }: Props) {
  const { state } = useSharedWords()
  const { run } = useRun()
  const ours = state.story === story && state.run === run && state.round === round
  if (!shared || !ours || !state.words) return null
  return (
    <Panel title={state.note ? NOTE_TITLE : wordsTitle(name)} icon={<MessageSquareText size={14} aria-hidden />}>
      {state.note && <p className="text-[16px] leading-snug font-medium text-ink">{`“${state.note}”`}</p>}
      <p className={`text-[14px] leading-snug text-ink-2 ${state.note ? 'mt-2' : ''}`}>
        <span className="font-semibold text-ink">{`${pronoun} words:`}</span> {`“${state.words}”`}
      </p>
    </Panel>
  )
}

export function LindaSkipperNote() {
  const { state } = useLindaCase()
  return <SkipperNote story="linda" name={LINDA_NAME} pronoun="Her" shared={state.shared} round={state.round} />
}

export function MichaelSkipperNote() {
  const { state } = useMichaelCheck()
  return <SkipperNote story="michael" name={MICHAEL_NAME} pronoun="His" shared={state.shared} round={0} />
}
