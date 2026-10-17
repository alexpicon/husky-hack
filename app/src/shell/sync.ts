import { useEffect, useRef } from 'react'
import { onAnnounce, sendRemote, subscribeRemote } from './remote'

const CHANNEL = 'second-look-sync'

type Message = { kind: string; json?: string; hello?: boolean }

/**
 * Keeps one piece of state identical across every open copy of the demo:
 * windows on the same laptop (BroadcastChannel), laptops on the dev server's
 * network (`npm run demo`), and any device in a shared session (/api/session).
 * A new copy joins at the current step instead of resetting the others.
 */
export function useWindowSync<T>(kind: string, state: T, apply: (state: T) => void) {
  const last = useRef<string | null>(null)
  const applyRef = useRef(apply)
  const send = useRef<(m: Message) => void>(() => {})

  useEffect(() => {
    applyRef.current = apply
  })

  useEffect(() => {
    const receive = (m: Message) => {
      if (!m || m.kind !== kind) return
      if (m.hello) {
        if (last.current) send.current({ kind, json: last.current })
        return
      }
      if (!m.json || m.json === last.current) return
      last.current = m.json
      applyRef.current(JSON.parse(m.json) as T)
    }
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL)
    if (channel) channel.onmessage = (e: MessageEvent<Message>) => receive(e.data)
    const hot = import.meta.hot
    hot?.on(CHANNEL, receive)
    const offRemote = subscribeRemote((k, json) => receive({ kind: k, json }))
    const offAnnounce = onAnnounce(() => {
      if (last.current) void sendRemote(kind, last.current)
    })
    send.current = (m) => {
      channel?.postMessage(m)
      hot?.send(CHANNEL, m)
      if (m.json && !m.hello) void sendRemote(kind, m.json)
    }
    channel?.postMessage({ kind, hello: true })
    hot?.send(CHANNEL, { kind, hello: true })
    return () => {
      channel?.close()
      hot?.off(CHANNEL, receive)
      offRemote()
      offAnnounce()
      send.current = () => {}
    }
  }, [kind])

  useEffect(() => {
    const json = JSON.stringify(state)
    if (last.current === null) {
      last.current = json
      return
    }
    if (json === last.current) return
    last.current = json
    send.current({ kind, json })
  }, [kind, state])
}
