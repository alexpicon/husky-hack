/** The panel pages' links, codes and posts to the wall, with fetch mocked. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GROUP_RESULTS, WALL_CODE } from './results'
import { newWallCode, panelLink, postToWall, readWallCode } from './wallClient'

vi.hoisted(() => {
  Object.assign(globalThis, {
    window: { location: { origin: 'https://demo.test', pathname: '/app/', search: '?session=ABCD&view=both' } },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('wall codes', () => {
  it('reads a code from the link, in capitals, or nothing', () => {
    expect(readWallCode('?view=panel&wall=ab12')).toBe('AB12')
    expect(readWallCode('?view=panel')).toBeNull()
    expect(readWallCode('?wall=no')).toBeNull()
    expect(readWallCode('?wall=AB-12')).toBeNull()
  })

  it('makes a short code a phone can type', () => {
    for (let i = 0; i < 20; i++) expect(newWallCode()).toMatch(WALL_CODE)
    expect(newWallCode(() => 0)).toBe('AAAAA')
    expect(newWallCode()).toHaveLength(5)
  })
})

describe('links', () => {
  it('open a panel page with its code, and never join the demo session', () => {
    expect(panelLink('panel', 'AB12')).toBe('https://demo.test/app/?view=panel&wall=AB12')
    expect(panelLink('wall')).toBe('https://demo.test/app/?view=wall')
    expect(panelLink('drill')).not.toContain('session')
  })
})

describe('posting to the wall', () => {
  const reply = (status: number, body: unknown) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status }))

  it('sends only the clipped quote, the result and an optional label', async () => {
    const fetch = reply(200, { entry: { n: 3, quote: 'my son needs bail', result: GROUP_RESULTS.grandparent } })
    vi.stubGlobal('fetch', fetch)
    const line = { quote: 'my son needs bail', result: GROUP_RESULTS.grandparent }
    expect(await postToWall('AB12', line)).toEqual({ ok: true, entry: { n: 3, ...line } })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/panel?id=AB12')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual(line)
  })

  it('says when the wall is full or busy', async () => {
    vi.stubGlobal('fetch', reply(429, { error: 'full' }))
    expect(await postToWall('AB12', { quote: 'q', result: GROUP_RESULTS.romance })).toEqual({ ok: false, reason: 'full' })
    vi.stubGlobal('fetch', reply(429, { error: 'busy' }))
    expect(await postToWall('AB12', { quote: 'q', result: GROUP_RESULTS.romance })).toEqual({ ok: false, reason: 'busy' })
  })

  it('says when the wall cannot be reached', async () => {
    vi.stubGlobal('fetch', reply(500, { error: 'oops' }))
    expect(await postToWall('AB12', { quote: 'q', result: GROUP_RESULTS.romance })).toEqual({
      ok: false,
      reason: 'offline',
    })
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('down'))))
    expect(await postToWall('AB12', { quote: 'q', result: GROUP_RESULTS.romance })).toEqual({
      ok: false,
      reason: 'offline',
    })
  })
})
