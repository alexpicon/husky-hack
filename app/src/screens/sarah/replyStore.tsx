import { useEffect, useState, useSyncExternalStore } from 'react'
import { useWindowSync } from '../../shell/sync'
import { mergeReplies, replyActions } from './reply'
import { claimSync, leadsSync, readReply, subscribeClaims, subscribeReply, useSarahReply, writeReply } from './replyState'

function Sync() {
  const state = useSyncExternalStore(subscribeReply, readReply, readReply)
  useWindowSync('sarah', state, (incoming) => {
    const local = readReply()
    const merged = mergeReplies(local, incoming)
    // A fresh object re-sends this window's newer reply to the one that sent a stale copy.
    writeReply(merged === local ? { ...local } : merged)
  })
  return null
}

/** Every Sarah pane that reads her reply mounts this; only one per window syncs. */
export function SarahReplySync() {
  const [id] = useState(() => Symbol('sarah-sync'))
  useEffect(() => claimSync(id), [id])
  const lead = useSyncExternalStore(subscribeClaims, () => leadsSync(id), () => false)
  return lead ? <Sync /> : null
}

/** On the story's first step: no reply yet, in every window. */
export function ResetSarahReply() {
  const { update } = useSarahReply()
  useEffect(() => update(replyActions.reset), [update])
  return <SarahReplySync />
}
