/** Shared sessions: what each poll of /api/session hands to the stores listening in this window. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { joinSession, leaveSession, subscribeRemote } from './remote'

vi.hoisted(() => {
  Object.assign(globalThis, {
    window: { location: { href: 'https://demo.test/', search: '' }, history: { replaceState: () => {} } },
    document: { visibilityState: 'visible' },
  })
})

type Entry = { json: string; rev: number }
const server: { state: Record<string, Entry> } = { state: {} }
const fetchMock = vi.fn(async () => ({ ok: true, json: async () => server.state }))
vi.stubGlobal('fetch', fetchMock)

const POLL_MS = 700
const nextPoll = () => vi.advanceTimersByTimeAsync(POLL_MS)

async function join(code: string) {
  joinSession(code)
  await vi.advanceTimersByTimeAsync(0)
}

beforeEach(() => {
  vi.useFakeTimers()
  fetchMock.mockClear()
  server.state = {}
})

afterEach(() => {
  leaveSession()
  vi.useRealTimers()
})

describe('a store that mounts after the first poll', () => {
  it("still gets the session's current entry", async () => {
    server.state = {
      position: { json: '{"active":"michael"}', rev: 4 },
      michael: { json: '{"shared":true}', rev: 9 },
    }
    const position = vi.fn()
    const offPosition = subscribeRemote('position', position)
    await join('LATE')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(position).toHaveBeenCalledExactlyOnceWith('{"active":"michael"}')

    // The story's own store mounts only once the polled position shows its step.
    const michael = vi.fn()
    const offMichael = subscribeRemote('michael', michael)
    await nextPoll()
    expect(michael).toHaveBeenCalledExactlyOnceWith('{"shared":true}')
    expect(position).toHaveBeenCalledTimes(1)
    offPosition()
    offMichael()
  })

  it('gets an entry that changed while no store for it was mounted', async () => {
    server.state = { sarah: { json: '{"answer":null}', rev: 1 } }
    const first = vi.fn()
    const offFirst = subscribeRemote('sarah', first)
    await join('BACK')
    expect(first).toHaveBeenCalledExactlyOnceWith('{"answer":null}')
    offFirst()

    server.state = { sarah: { json: '{"answer":"yes"}', rev: 2 } }
    await nextPoll()
    const again = vi.fn()
    const offAgain = subscribeRemote('sarah', again)
    await nextPoll()
    expect(again).toHaveBeenCalledExactlyOnceWith('{"answer":"yes"}')
    expect(first).toHaveBeenCalledTimes(1)
    offAgain()
  })
})

describe('a mounted store', () => {
  it('hears each revision once, and only for its own kind', async () => {
    server.state = { james: { json: '{"a":1}', rev: 3 }, m1039: { json: '{"b":1}', rev: 5 } }
    const james = vi.fn()
    const off = subscribeRemote('james', james)
    await join('ONCE')
    await nextPoll()
    expect(james).toHaveBeenCalledExactlyOnceWith('{"a":1}')

    server.state = { ...server.state, james: { json: '{"a":2}', rev: 6 } }
    await nextPoll()
    expect(james).toHaveBeenCalledTimes(2)
    expect(james).toHaveBeenLastCalledWith('{"a":2}')
    off()
  })
})
