/** Skipper in the browser: keywords unless the server says AI, and keywords again on any failure. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { draftNote, resetSkipperMode, skipperMode, suggestTaps } from './client'

const TEXT = 'my grandsons lawyer says hes in jail dont tell anyone'

/** A stand-in server: GET says the mode, POST answers with `post`. */
function server(mode: 'ai' | 'keywords', post: () => Response) {
  const fetch = vi.fn(async (_url: string, init?: { method?: string }) =>
    init?.method === 'POST' ? post() : Response.json({ mode }),
  )
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const posts = (fetch: ReturnType<typeof server>) => fetch.mock.calls.filter(([, init]) => init?.method === 'POST')

beforeEach(resetSkipperMode)
afterEach(() => vi.unstubAllGlobals())

describe('skipperMode', () => {
  it('is AI only when the server says so', async () => {
    server('ai', () => Response.json({}))
    expect(await skipperMode()).toBe('ai')
    resetSkipperMode()
    server('keywords', () => Response.json({}))
    expect(await skipperMode()).toBe('keywords')
  })

  it('is keywords when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))))
    expect(await skipperMode()).toBe('keywords')
  })
})

describe('suggestTaps', () => {
  it('never sends her words in keyword mode', async () => {
    const fetch = server('keywords', () => Response.json({ taps: [] }))
    const got = await suggestTaps('linda', TEXT)
    expect(got.source).toBe('keywords')
    expect(got.taps.map((t) => t.id)).toEqual(['family', 'official', 'secret'])
    expect(posts(fetch)).toHaveLength(0)
  })

  it('never sends them when the screen showed keyword mode, whatever the server says', async () => {
    const fetch = server('ai', () => Response.json({ taps: [] }))
    expect((await suggestTaps('linda', TEXT, 'keywords')).source).toBe('keywords')
    expect(posts(fetch)).toHaveLength(0)
  })

  it('checks the AI answer again in the browser', async () => {
    const fetch = server('ai', () =>
      Response.json({
        taps: [
          { id: 'official', quote: 'lawyer' },
          { id: 'none', quote: 'lawyer' },
          { id: 'bail', quote: 'bail' },
        ],
      }),
    )
    expect(await suggestTaps('linda', TEXT, 'ai')).toEqual({
      taps: [{ id: 'official', quote: 'lawyer' }],
      source: 'ai',
    })
    const body = JSON.parse((posts(fetch)[0][1] as unknown as { body: string }).body)
    expect(body).toEqual({ mode: 'taps', screen: 'linda', text: TEXT })
  })

  it('falls back to keywords on an error or a network failure', async () => {
    server('ai', () => new Response('', { status: 502 }))
    expect((await suggestTaps('linda', TEXT, 'ai')).source).toBe('keywords')
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new DOMException('late', 'TimeoutError'))))
    const late = await suggestTaps('michael', 'we met online, crypto platform', 'ai')
    expect(late).toEqual({
      taps: [
        { id: 'never-met', quote: 'met online' },
        { id: 'investment', quote: 'crypto' },
      ],
      source: 'keywords',
    })
  })

  it('sends at most 500 characters', async () => {
    const fetch = server('ai', () => Response.json({ taps: [] }))
    await suggestTaps('linda', 'x'.repeat(900), 'ai')
    expect(JSON.parse((posts(fetch)[0][1] as unknown as { body: string }).body).text).toHaveLength(500)
  })
})

describe('draftNote', () => {
  it('is null in keyword mode, with nothing sent', async () => {
    const fetch = server('keywords', () => Response.json({ note: 'Member says hi.' }))
    expect(await draftNote(TEXT)).toBeNull()
    expect(posts(fetch)).toHaveLength(0)
  })

  it('returns a note that passes the check, and null for one that fails', async () => {
    server('ai', () => Response.json({ note: "Member says her grandson's lawyer called." }))
    expect(await draftNote('lawyer called about my grandson', 'ai')).toBe("Member says her grandson's lawyer called.")
    server('ai', () => Response.json({ note: 'It is safe to release.' }))
    expect(await draftNote('a different story', 'ai')).toBeNull()
  })
})
