import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useLindaCase } from '../screens/linda/lindaCase'
import { useMichaelCheck } from '../screens/michael/checkState'
import { useRun } from '../shell/run'
import { useWindowSync } from '../shell/sync'
import { draftNote } from './client'
import { firstSeen, publishStep } from './publish'
import {
  heardWords,
  initialWords,
  mergeWords,
  readHeardVersion,
  readWords,
  subscribeHeard,
  useSharedWords,
  wordsActions,
  writeWords,
  type SharedWords,
  type SkipperStory,
} from './shareState'

/** Fills the shared copy only while she shares (see `publishStep`), and adds Skipper's note to it. */
function usePublish(story: SkipperStory, shared: boolean, run: number, round: number) {
  const { state, update } = useSharedWords()
  const version = useSyncExternalStore(subscribeHeard, readHeardVersion, readHeardVersion)
  const seen = useRef(firstSeen(shared, round))

  useEffect(() => {
    const step = publishStep(story, seen.current, { shared, run, round, words: heardWords(story, run, round) }, state)
    seen.current = step.seen
    if (step.change) update(step.change)
    const words = step.sent
    if (!words) return
    void draftNote(words).then((note) => {
      if (note) update((s) => wordsActions.note(s, story, words, note))
    })
  }, [story, shared, run, round, state, version, update])
}

function Sync() {
  const { state, update } = useSharedWords()
  const { run } = useRun()
  useEffect(() => update((s) => wordsActions.forRun(s, run)), [run, update])
  useWindowSync('skipper', state, (sent: Partial<SharedWords>) => {
    const local = readWords()
    const merged = mergeWords(local, { ...initialWords, ...sent })
    // A fresh object re-sends this window's newer copy to the one that sent a stale copy.
    writeWords(merged === local ? { ...local } : merged)
  })
  return null
}

/** Mounted once per window: keeps the shared copy in step with every window and with her share switch. */
export function SkipperShare() {
  const { run } = useRun()
  const linda = useLindaCase().state
  const michael = useMichaelCheck().state
  usePublish('linda', linda.shared, run, linda.round)
  usePublish('michael', michael.shared, run, 0)
  return <Sync />
}
