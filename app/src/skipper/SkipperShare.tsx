import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useLindaCase } from '../screens/linda/lindaCase'
import { useMichaelCheck } from '../screens/michael/checkState'
import { useRun } from '../shell/run'
import { useWindowSync } from '../shell/sync'
import { draftNote } from './client'
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

/**
 * Fills the shared copy only while she shares: her words go out when she turns sharing on (or
 * types while it is on), and come back out when she turns it off or her case starts over.
 */
function usePublish(story: SkipperStory, shared: boolean, run: number, round: number) {
  const { state, update } = useSharedWords()
  const version = useSyncExternalStore(subscribeHeard, readHeardVersion, readHeardVersion)
  const was = useRef({ shared, round })

  useEffect(() => {
    const before = was.current
    was.current = { shared, round }
    const ours = state.story === story
    // Only a change seen here clears it, so a window that has not yet heard she shares never does.
    if (ours && state.words && ((before.shared && !shared) || round > before.round)) {
      update(wordsActions.clear)
      return
    }
    const words = shared ? heardWords(story, run, round) : null
    if (!words) return
    if (ours && state.run === run && state.round === round && state.words === words) return
    update((s) => wordsActions.publish(s, story, run, round, words))
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
