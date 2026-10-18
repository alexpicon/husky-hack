import { useEffect, useRef } from 'react'
import { birth, change, newPeer, receive, type Peer, type Signal, type Step } from './handshake'
import { onAnnounce, sendRemote, subscribeRemote } from './remote'

const CHANNEL = 'second-look-sync'

/** This window's age, shared by every kind of state it syncs. */
const BORN = birth()

type Message = Signal & { kind: string }

/**
 * Keeps one piece of state identical across every open copy of the demo:
 * windows on the same laptop (BroadcastChannel), laptops on the dev server's
 * network (`npm run demo`), and any device in a shared session (/api/session).
 * A new copy joins at the current step instead of resetting the others.
 */
export function useWindowSync<T>(kind: string, state: T, apply: (state: T) => void) {
  const peer = useRef<Peer>(newPeer(BORN))
  const applyRef = useRef(apply)
  const send = useRef<(m: Message) => void>(() => {})

  useEffect(() => {
    applyRef.current = apply
  })

  useEffect(() => {
    const run = (step: Step) => {
      peer.current = step.peer
      if (step.send) send.current({ kind, ...step.send })
      if (step.apply !== undefined) applyRef.current(JSON.parse(step.apply) as T)
    }
    const onMessage = (m: Message) => {
      if (m && m.kind === kind) run(receive(peer.current, m))
    }
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL)
    if (channel) channel.onmessage = (e: MessageEvent<Message>) => onMessage(e.data)
    const hot = import.meta.hot
    hot?.on(CHANNEL, onMessage)
    const offRemote = subscribeRemote((k, json) => onMessage({ kind: k, json }))
    const offAnnounce = onAnnounce(() => {
      if (peer.current.json !== null) void sendRemote(kind, peer.current.json)
    })
    send.current = (m) => {
      channel?.postMessage(m)
      hot?.send(CHANNEL, m)
      if (m.json && !m.hello) void sendRemote(kind, m.json)
    }
    send.current({ kind, hello: BORN })
    return () => {
      channel?.close()
      hot?.off(CHANNEL, onMessage)
      offRemote()
      offAnnounce()
      send.current = () => {}
    }
  }, [kind])

  useEffect(() => {
    const step = change(peer.current, JSON.stringify(state))
    peer.current = step.peer
    if (step.send) send.current({ kind, ...step.send })
  }, [kind, state])
}
