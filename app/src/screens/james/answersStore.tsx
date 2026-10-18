import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRun } from '../../shell/run'
import { useWindowSync } from '../../shell/sync'
import { answerActions } from './answers'
import {
  changeAnswers,
  claimSync,
  leadsSync,
  readAnswers,
  receiveAnswers,
  startRun,
  subscribeAnswers,
  subscribeClaims,
} from './answersState'

function Sync() {
  const state = useSyncExternalStore(subscribeAnswers, readAnswers, readAnswers)
  useWindowSync('james', state, receiveAnswers)
  return null
}

/** Both panes of every step mount this; only one per window syncs, so a window never talks to itself. */
export function JamesSync() {
  const { run } = useRun()
  const [id] = useState(() => Symbol('james-sync'))
  useEffect(() => claimSync(id), [id])
  useEffect(() => startRun(run), [run])
  const lead = useSyncExternalStore(subscribeClaims, () => leadsSync(id), () => false)
  return lead ? <Sync /> : null
}

/** Clears his taps and the teller's choices whenever the story is back on its first step. */
export function ResetJames() {
  useEffect(() => changeAnswers(answerActions.reset), [])
  return null
}
