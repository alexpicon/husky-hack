import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useRunReset } from '../../shell/run'
import { useWindowSync } from '../../shell/sync'
import { useStory } from '../../story/engine'
import {
  answerActions,
  claimSync,
  isBlank,
  leadsSync,
  mergeAnswers,
  readAnswer,
  subscribeAnswer,
  subscribeClaims,
  updateAnswer,
  writeAnswer,
} from './answerState'

function Sync() {
  const state = useSyncExternalStore(subscribeAnswer, readAnswer, readAnswer)
  useWindowSync('m1039', state, (incoming) => {
    const local = readAnswer()
    const merged = mergeAnswers(local, incoming)
    // A fresh object re-sends this window's newer answer to the one that sent a stale copy.
    writeAnswer(merged === local ? { ...local } : merged)
  })
  return null
}

/** Every M1039 pane mounts this; only one per window syncs, so a window never talks to itself. */
function M1039AnswerSync() {
  const [id] = useState(() => Symbol('m1039-sync'))
  useEffect(() => claimSync(id), [id])
  const lead = useSyncExternalStore(subscribeClaims, () => leadsSync(id), () => false)
  return lead ? <Sync /> : null
}

/**
 * Wraps each M1039 pane. It shares the answer across windows, clears an answer from an
 * earlier demo run, and on the first step (`fresh`) clears any answer, since none is given yet.
 */
export function AnswerScope({ fresh = false, children }: { fresh?: boolean; children: ReactNode }) {
  const { index, goTo } = useStory()
  const state = useSyncExternalStore(subscribeAnswer, readAnswer, readAnswer)
  const toRun = useCallback(
    (run: number) => {
      updateAnswer((s) => answerActions.reset(s, run))
      // The narrator reads the last steps' words from the answer when it draws, and a new run
      // need not change the step; staying on this step redraws it.
      goTo(index)
    },
    [index, goTo],
  )
  useRunReset(state.run, toRun)
  const answered = !isBlank(state)
  useEffect(() => {
    if (fresh && answered) updateAnswer((s) => answerActions.reset(s, s.run))
  }, [fresh, answered])
  return (
    <>
      <M1039AnswerSync />
      {children}
    </>
  )
}
