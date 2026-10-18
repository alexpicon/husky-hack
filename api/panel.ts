/**
 * The panel wall: each judge's phone appends one result to a short list that
 * a laptop shows live. Append-only, capped and expiring, under its own panel:
 * keys, so nothing posted here can change a story on the presenter screens.
 * Only the result and a 40-character quote are kept, never the full text.
 *
 * No imports, like api/session.ts: the rules below mirror
 * app/src/panel/results.ts, and a test there keeps the two identical.
 */
export const RESULTS = [
  'fits grandparent scam · wire held',
  'fits government scam · teller heads-up',
  'fits relationship investment scam · every wire gets a call',
  "doesn't fit one pattern · a person still checks",
]
export const LIMITS = { keep: 40, perCode: 120, perIp: 15, ipWindowSeconds: 60, ttlSeconds: 6 * 60 * 60 }
const QUOTE_MAX = 40
const CODE = /^[A-Z0-9]{4,8}$/
const JUDGE = /^[A-Za-z0-9 ]{1,20}$/
const MAX_BODY = 2000

type Entry = { n: number; quote: string; result: string; judge?: string }
type Wall = { entries: Entry[]; count: number; expires: number }
export type Redis = (command: (string | number)[]) => Promise<unknown>

export type PanelStore = {
  name: string
  /** The kept lines, oldest first. */
  list: (code: string) => Promise<Entry[]>
  /** Counts one more post to the code and returns its number, from 1. */
  next: (code: string) => Promise<number>
  /** Adds a line, drops the oldest past the cap, and restarts the code's expiry. */
  append: (code: string, entry: Entry) => Promise<void>
  /** Counts one more post from an address in its current window. */
  hit: (ip: string) => Promise<number>
}

export function clipQuote(text: string) {
  const chars = Array.from(text.replace(/\p{Cc}/gu, ' ').replace(/\s+/g, ' ').trim())
  return chars.length > QUOTE_MAX ? `${chars.slice(0, QUOTE_MAX).join('').trimEnd()}…` : chars.join('')
}

const listKey = (code: string) => `panel:${code}`
const countKey = (code: string) => `panel:${code}:n`
const ipKey = (ip: string) => `panel:ip:${ip}`

export function memoryStore(now = () => Date.now()): PanelStore {
  const walls = new Map<string, Wall>()
  const ips = new Map<string, { count: number; expires: number }>()
  const wall = (code: string) => {
    const found = walls.get(code)
    if (found && found.expires > now()) return found
    const fresh: Wall = { entries: [], count: 0, expires: now() + LIMITS.ttlSeconds * 1000 }
    walls.set(code, fresh)
    return fresh
  }
  return {
    name: 'memory',
    list: async (code) => {
      const found = walls.get(code)
      return found && found.expires > now() ? [...found.entries] : []
    },
    next: async (code) => {
      const w = wall(code)
      w.count += 1
      w.expires = now() + LIMITS.ttlSeconds * 1000
      return w.count
    },
    append: async (code, entry) => {
      const w = wall(code)
      w.entries = [...w.entries, entry].slice(-LIMITS.keep)
      w.expires = now() + LIMITS.ttlSeconds * 1000
    },
    hit: async (ip) => {
      const found = ips.get(ip)
      const slot =
        found && found.expires > now() ? found : { count: 0, expires: now() + LIMITS.ipWindowSeconds * 1000 }
      slot.count += 1
      ips.set(ip, slot)
      return slot.count
    },
  }
}

export function redisStore(db: Redis): PanelStore {
  return {
    name: 'redis',
    list: async (code) =>
      ((await db(['LRANGE', listKey(code), 0, -1])) as string[]).map((v) => JSON.parse(v) as Entry),
    next: async (code) => {
      const n = (await db(['INCR', countKey(code)])) as number
      await db(['EXPIRE', countKey(code), LIMITS.ttlSeconds])
      return n
    },
    append: async (code, entry) => {
      await db(['RPUSH', listKey(code), JSON.stringify(entry)])
      await db(['LTRIM', listKey(code), -LIMITS.keep, -1])
      await db(['EXPIRE', listKey(code), LIMITS.ttlSeconds])
    },
    hit: async (ip) => {
      // NX keeps the window's first expiry, so steady posting can't hold it open.
      await db(['SET', ipKey(ip), 0, 'EX', LIMITS.ipWindowSeconds, 'NX'])
      return (await db(['INCR', ipKey(ip)])) as number
    },
  }
}

const reply = (body: unknown, store: string, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-panel-store': store },
  })

function wallCode(request: Request) {
  const code = new URL(request.url).searchParams.get('id')?.toUpperCase() ?? ''
  return CODE.test(code) ? code : null
}

function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}

async function readEntry(request: Request) {
  const text = await request.text()
  if (text.length > MAX_BODY) return null
  try {
    const body = JSON.parse(text) as { quote?: unknown; result?: unknown; judge?: unknown }
    const quote = typeof body.quote === 'string' ? clipQuote(body.quote) : ''
    if (!quote || typeof body.result !== 'string' || !RESULTS.includes(body.result)) return null
    const judge = typeof body.judge === 'string' && JUDGE.test(body.judge.trim()) ? body.judge.trim() : null
    return { quote, result: body.result, ...(judge ? { judge } : {}) }
  } catch {
    return null
  }
}

/** GET and POST over any store, so tests can run them on a fake clock. */
export function panelApi(store: PanelStore) {
  return {
    async GET(request: Request) {
      const code = wallCode(request)
      if (!code) return reply({ error: 'bad wall code' }, store.name, 400)
      return reply({ entries: await store.list(code) }, store.name)
    },
    async POST(request: Request) {
      const code = wallCode(request)
      if (!code) return reply({ error: 'bad wall code' }, store.name, 400)
      const line = await readEntry(request)
      if (!line) return reply({ error: 'bad entry' }, store.name, 400)
      if ((await store.hit(clientIp(request))) > LIMITS.perIp) return reply({ error: 'busy' }, store.name, 429)
      const n = await store.next(code)
      if (n > LIMITS.perCode) return reply({ error: 'full' }, store.name, 429)
      const entry: Entry = { n, ...line }
      await store.append(code, entry)
      return reply({ entry }, store.name)
    },
  }
}

/** Upstash REST credentials under any prefix Vercel's integration used, as in api/session.ts. */
function redis(): Redis | null {
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}
  const urlKey = Object.keys(env).find((k) => k.endsWith('KV_REST_API_URL') || k.endsWith('REDIS_REST_URL'))
  const url = urlKey && env[urlKey]
  const token = urlKey && env[urlKey.replace(/URL$/, 'TOKEN')]
  if (!url || !token) return null
  return async (command) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(command),
    })
    if (!res.ok) throw new Error(`Redis responded ${res.status}`)
    return ((await res.json()) as { result: unknown }).result
  }
}

const memory = memoryStore()
const api = () => {
  const db = redis()
  return panelApi(db ? redisStore(db) : memory)
}

export function GET(request: Request) {
  return api().GET(request)
}

export function POST(request: Request) {
  return api().POST(request)
}
