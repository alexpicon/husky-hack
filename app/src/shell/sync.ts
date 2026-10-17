import { useEffect, useRef } from 'react'

const CHANNEL = 'second-look-sync'

type Message = { kind: string; json?: string; hello?: boolean }

/**
 * Keeps one piece of state identical across every open copy of the demo:
 * windows on the same laptop (BroadcastChannel) and, when served by
 * `npm run demo`, other laptops on the network (the dev server relays it).
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
    send.current = (m) => {
      channel?.postMessage(m)
      hot?.send(CHANNEL, m)
    }
    send.current({ kind, hello: true })
    return () => {
      channel?.close()
      hot?.off(CHANNEL, receive)
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
