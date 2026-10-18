/** How windows join each other: who answers a hello, whose answer a new window takes, and when. */
import { describe, expect, it } from 'vitest'
import { change, newPeer, olderThan, receive, type Birth, type Peer, type Signal } from './handshake'

const born = (at: number, tie = 0.5): Birth => ({ at, tie })

/** A window that has rendered its startup state. */
const started = (b: Birth, json: string): Peer => change(newPeer(b), json).peer

describe('which window is older', () => {
  it('orders by start time, then by the tiebreak', () => {
    expect(olderThan(born(1), born(2))).toBe(true)
    expect(olderThan(born(2), born(1))).toBe(false)
    expect(olderThan(born(1, 0.1), born(1, 0.9))).toBe(true)
    expect(olderThan(born(1, 0.9), born(1, 0.1))).toBe(false)
  })

  it('never calls a window older than itself', () => {
    expect(olderThan(born(1), born(1))).toBe(false)
  })
})

describe('answering a hello', () => {
  const a = started(born(1), '"A"')

  it('replies with its state and birth only to a younger window', () => {
    expect(receive(a, { hello: born(2) }).send).toEqual({ json: '"A"', reply: born(1) })
    expect(receive(a, { hello: born(0) }).send).not.toHaveProperty('reply')
  })

  it("says hello back, once, to an older window's hello while it holds its startup state", () => {
    const first = receive(a, { hello: born(0) })
    expect(first.send).toEqual({ hello: born(1) })
    expect(receive(first.peer, { hello: born(0) }).send).toBeUndefined()
  })

  it('shares its live state with an older window that started listening after it moved on', () => {
    const moved = change(a, '"A2"').peer
    expect(receive(moved, { hello: born(0) }).send).toEqual({ json: '"A2"' })
  })
})

describe('taking a reply', () => {
  const b = started(born(2), '"B"')

  it("takes an older window's state while it still holds its own startup state", () => {
    const step = receive(b, { json: '"A"', reply: born(1) })
    expect(step.apply).toBe('"A"')
    expect(step.peer.source).toEqual(born(1))
  })

  it("never takes a younger window's reply", () => {
    expect(receive(b, { json: '"C"', reply: born(3) }).apply).toBeUndefined()
  })

  it('ignores replies once it has changed its own state', () => {
    const moved = change(b, '"B2"').peer
    expect(moved.settled).toBe(true)
    expect(receive(moved, { json: '"A"', reply: born(1) }).apply).toBeUndefined()
  })

  it('ignores replies once it has taken a live update', () => {
    const live = receive(b, { json: '"L"' })
    expect(live.apply).toBe('"L"')
    expect(receive(live.peer, { json: '"A"', reply: born(1) }).apply).toBeUndefined()
  })

  it('ends on the oldest reply, whatever order the replies arrive in', () => {
    const fromOldest = { json: '"A"', reply: born(0) }
    const fromOlder = { json: '"O"', reply: born(1) }
    const oldestLast = receive(receive(b, fromOlder).peer, fromOldest)
    expect(oldestLast.apply).toBe('"A"')
    const oldestFirst = receive(b, fromOldest)
    expect(receive(oldestFirst.peer, fromOlder).apply).toBeUndefined()
    expect(oldestFirst.peer.json).toBe('"A"')
  })
})

describe('own changes', () => {
  it('keeps the startup state without sending it, then sends each change', () => {
    const fresh = newPeer(born(1))
    const first = change(fresh, '"A"')
    expect(first.send).toBeUndefined()
    expect(first.peer.settled).toBe(false)
    expect(change(first.peer, '"A"').send).toBeUndefined()
    expect(change(first.peer, '"A2"').send).toEqual({ json: '"A2"' })
  })
})

type Window = { name: string; peer: Peer; listening: boolean }

/**
 * `greeters` say hello, and every signal goes to every other window that is listening, in an
 * order picked by `pick`, the way a broadcast channel gives no order between senders.
 */
function settle(windows: Window[], greeters: Window[], pick: (n: number) => number) {
  const queue: { to: Window; m: Signal }[] = []
  const broadcast = (from: Window, m: Signal) => {
    for (const w of windows) if (w !== from) queue.push({ to: w, m })
  }
  for (const w of greeters) broadcast(w, { hello: w.peer.born })
  while (queue.length) {
    const [{ to, m }] = queue.splice(pick(queue.length), 1)
    if (!to.listening) continue
    const step = receive(to.peer, m)
    to.peer = step.peer
    if (step.send) broadcast(to, step.send)
  }
  return windows.map((w) => w.peer.json)
}

/** A small deterministic generator, so a failing order can be replayed. */
function orders(seed: number) {
  let s = seed
  return (n: number) => {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0
    return s % n
  }
}

describe('windows opened at the same moment', () => {
  const open = (...names: string[]) =>
    names.map((name, i) => ({ name, peer: started(born(100, i / 10), `"${name}"`), listening: true }))

  it("end on the oldest window's state and never swap, in any delivery order", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const two = open('A', 'B')
      expect(settle(two, two, orders(seed))).toEqual(['"A"', '"A"'])
      const three = open('A', 'B', 'C')
      expect(settle(three, three, orders(seed))).toEqual(['"A"', '"A"', '"A"'])
    }
  })

  it('converge when the older window starts listening after the younger said hello', () => {
    const [a, b] = open('A', 'B')
    a.listening = false
    expect(settle([a, b], [b], orders(7))).toEqual(['"A"', '"B"'])
    a.listening = true
    expect(settle([a, b], [a], orders(7))).toEqual(['"A"', '"A"'])
  })

  it('join a window that has moved on, even one that looks younger', () => {
    const [a, b] = open('A', 'B')
    b.peer = change(b.peer, '"B2"').peer
    expect(settle([a, b], [a], orders(3))).toEqual(['"B2"', '"B2"'])
  })
})
