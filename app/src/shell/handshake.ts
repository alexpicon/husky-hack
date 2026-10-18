/**
 * How a window joins the others. It says hello with its birth; only a window older than it
 * answers, and it takes the oldest answer while it still holds its startup state. Two windows
 * opened together therefore both end on the older one's state, never on each other's.
 */

/** When a window's page started, with a random tiebreak for pages started at the same instant. */
export type Birth = { at: number; tie: number }

/** A hello, a join reply carrying the replier's birth, or a live update (json alone). */
export type Signal = { json?: string; hello?: Birth; reply?: Birth }

/** One window's side of one kind of shared state. */
export type Peer = {
  born: Birth
  /** The state as JSON, as this window last sent or applied it; null before its first render. */
  json: string | null
  /** Birth of the window whose state this one holds: its own, until it adopts an older one's. */
  source: Birth
  /** It changed its state, or took a live update, since startup, so join replies are stale to it. */
  settled: boolean
  /** It has already said hello back to an older window's hello. */
  greeted: boolean
}

export type Step = { peer: Peer; send?: Signal; apply?: string }

export const birth = (): Birth => ({ at: performance.timeOrigin, tie: Math.random() })

export const olderThan = (a: Birth, b: Birth) => a.at < b.at || (a.at === b.at && a.tie < b.tie)

export const newPeer = (born: Birth): Peer => ({ born, json: null, source: born, settled: false, greeted: false })

const take = (peer: Peer, json: string): Step =>
  json === peer.json ? { peer } : { peer: { ...peer, json }, apply: json }

export function receive(peer: Peer, m: Signal): Step {
  if (m.hello) {
    if (olderThan(peer.born, m.hello)) {
      return { peer, send: peer.json === null ? undefined : { json: peer.json, reply: peer.born } }
    }
    // An older window that says hello now missed this one's hello: it started listening later.
    if (peer.settled) return { peer, send: peer.json === null ? undefined : { json: peer.json } }
    if (peer.greeted) return { peer }
    return { peer: { ...peer, greeted: true }, send: { hello: peer.born } }
  }
  if (m.json === undefined) return { peer }
  if (m.reply) {
    if (peer.settled || !olderThan(m.reply, peer.source)) return { peer }
    return take({ ...peer, source: m.reply }, m.json)
  }
  return take({ ...peer, settled: true }, m.json)
}

/** The state after a render: the window's startup state, or its own change, sent to the others. */
export function change(peer: Peer, json: string): Step {
  if (peer.json === null) return { peer: { ...peer, json } }
  if (json === peer.json) return { peer }
  return { peer: { ...peer, json, settled: true }, send: { json } }
}
