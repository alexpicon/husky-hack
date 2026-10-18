/** The panel wall's server function (api/panel.ts), run on its in-memory store and a fake clock. */
import { describe, expect, it } from 'vitest'
import * as server from '../../../api/panel'
import { LIMITS, memoryStore, panelApi, redisStore, RESULTS, type Redis } from '../../../api/panel'
import { clipQuote, GROUP_RESULTS, NO_PATTERN, PANEL_RESULTS, WALL_LIMITS, type PanelEntry } from './results'

function setup() {
  const clock = { t: Date.UTC(2026, 9, 18, 12) }
  const api = panelApi(memoryStore(() => clock.t))
  const get = async (code = 'WALL1') => {
    const res = await api.GET(new Request(`http://x/api/panel?id=${code}`))
    return { status: res.status, body: (await res.json()) as { entries: PanelEntry[]; error?: string } }
  }
  const post = async (body: unknown, { code = 'WALL1', ip = '10.0.0.1' } = {}) => {
    const res = await api.POST(
      new Request(`http://x/api/panel?id=${code}`, {
        method: 'POST',
        headers: { 'x-forwarded-for': `${ip}, 10.9.9.9` },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      }),
    )
    return { status: res.status, body: (await res.json()) as { entry: PanelEntry; error?: string } }
  }
  return { clock, get, post }
}

const line = (quote = 'lawyer says dont tell mom', result = GROUP_RESULTS.grandparent) => ({ quote, result })

describe('the server and the app agree', () => {
  it('on the result allowlist, the limits and the clipping', () => {
    expect(RESULTS).toEqual(PANEL_RESULTS)
    expect(LIMITS).toEqual(WALL_LIMITS)
    for (const t of ['short', ' two  spaces ', 'x'.repeat(80), `${'a'.repeat(39)}🙂🙂`]) {
      expect(server.clipQuote(t)).toBe(clipQuote(t))
    }
  })

  it('only reads and appends: no way to edit or delete a line', () => {
    expect(typeof server.GET).toBe('function')
    expect(typeof server.POST).toBe('function')
    for (const method of ['PUT', 'PATCH', 'DELETE']) expect(server).not.toHaveProperty(method)
  })
})

describe('reading the wall', () => {
  it('rejects a bad code and starts empty', async () => {
    const { get } = setup()
    expect((await get('no')).status).toBe(400)
    expect(await get()).toEqual({ status: 200, body: { entries: [] } })
  })
})

describe('posting a result', () => {
  it('appends numbered lines, newest last', async () => {
    const { get, post } = setup()
    expect((await post(line('my son needs bail'))).body.entry).toEqual({
      n: 1,
      quote: 'my son needs bail',
      result: GROUP_RESULTS.grandparent,
    })
    await post(line('IRS warrant, buy gift cards', GROUP_RESULTS.government))
    const { entries } = (await get()).body
    expect(entries.map((e) => e.n)).toEqual([1, 2])
    expect(entries[1].result).toBe(GROUP_RESULTS.government)
  })

  it('keeps only the first 40 characters, never the full text', async () => {
    const { get, post } = setup()
    const text = "my grandson's lawyer called, he is in jail and needs bail money today, don't tell his mom"
    await post(line(text))
    const [entry] = (await get()).body.entries
    expect(entry.quote).toBe(clipQuote(text))
    expect(JSON.stringify(entry)).not.toContain('bail money today')
  })

  it('takes only a result from the allowlist', async () => {
    const { get, post } = setup()
    expect((await post(line('hi', 'safe · no risk'))).status).toBe(400)
    expect((await post({ quote: 'hi' })).status).toBe(400)
    expect((await post({ result: NO_PATTERN })).status).toBe(400)
    expect((await post(line('   ', NO_PATTERN))).status).toBe(400)
    expect((await post('not json')).status).toBe(400)
    expect((await post(line('x'.repeat(3000)))).status).toBe(400)
    expect((await post(line('hi'), { code: 'bad!' })).status).toBe(400)
    expect((await get()).body.entries).toEqual([])
  })

  it('keeps a short judge label and drops anything else', async () => {
    const { post } = setup()
    expect((await post({ ...line(), judge: 'Presenter' })).body.entry.judge).toBe('Presenter')
    expect((await post({ ...line(), judge: '<b>hi</b>' }, { ip: '10.0.0.2' })).body.entry.judge).toBeUndefined()
  })

  it('keeps each code apart', async () => {
    const { get, post } = setup()
    await post(line(), { code: 'WALL1' })
    await post(line(), { code: 'WALL2' })
    expect((await get('WALL1')).body.entries).toHaveLength(1)
    expect((await get('WALL2')).body.entries[0].n).toBe(1)
  })
})

describe('limits', () => {
  it('keeps the last 40 lines, numbers unchanged', async () => {
    const { get, post } = setup()
    for (let i = 0; i < 45; i++) await post(line(`judge ${i + 1}`), { ip: `10.1.0.${i}` })
    const { entries } = (await get()).body
    expect(entries).toHaveLength(WALL_LIMITS.keep)
    expect(entries[0]).toMatchObject({ n: 6, quote: 'judge 6' })
    expect(entries.at(-1)).toMatchObject({ n: 45, quote: 'judge 45' })
  })

  it('stops a code after 120 posts', async () => {
    const { post } = setup()
    for (let i = 0; i < WALL_LIMITS.perCode; i++) {
      expect((await post(line(), { ip: `10.2.${Math.floor(i / 10)}.${i % 10}` })).status).toBe(200)
    }
    expect(await post(line(), { ip: '10.3.0.1' })).toEqual({ status: 429, body: { error: 'full' } })
  })

  it('slows one address down, then lets it post again after the window', async () => {
    const { clock, post } = setup()
    for (let i = 0; i < WALL_LIMITS.perIp; i++) expect((await post(line())).status).toBe(200)
    expect(await post(line())).toEqual({ status: 429, body: { error: 'busy' } })
    expect((await post(line(), { ip: '10.0.0.7' })).status).toBe(200)
    clock.t += WALL_LIMITS.ipWindowSeconds * 1000 + 1
    expect((await post(line())).status).toBe(200)
  })

  it('forgets the wall after the time limit', async () => {
    const { clock, get, post } = setup()
    await post(line())
    clock.t += WALL_LIMITS.ttlSeconds * 1000 + 1
    expect((await get()).body.entries).toEqual([])
    expect((await post(line(), { ip: '10.0.0.9' })).body.entry.n).toBe(1)
  })
})

describe('the Redis store', () => {
  it('uses only panel: keys, trims to the cap and sets an expiry', async () => {
    const calls: (string | number)[][] = []
    const db: Redis = async (command) => {
      calls.push(command)
      if (command[0] === 'INCR') return 1
      if (command[0] === 'LRANGE') return [JSON.stringify({ n: 1, quote: 'q', result: NO_PATTERN })]
      return 'OK'
    }
    const store = redisStore(db)
    await store.hit('1.2.3.4')
    await store.next('WALL1')
    await store.append('WALL1', { n: 1, quote: 'q', result: NO_PATTERN })
    expect(await store.list('WALL1')).toEqual([{ n: 1, quote: 'q', result: NO_PATTERN }])
    expect(calls.every((c) => String(c[1]).startsWith('panel:'))).toBe(true)
    expect(calls).toContainEqual(['LTRIM', 'panel:WALL1', -WALL_LIMITS.keep, -1])
    expect(calls).toContainEqual(['EXPIRE', 'panel:WALL1', WALL_LIMITS.ttlSeconds])
    expect(calls).toContainEqual(['SET', 'panel:ip:1.2.3.4', 0, 'EX', WALL_LIMITS.ipWindowSeconds, 'NX'])
  })
})
