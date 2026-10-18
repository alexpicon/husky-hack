/**
 * Shared demo sessions: laptops that join the same code see the same step.
 * State lives in Upstash Redis when the project has it (Vercel Storage), else
 * in this function's memory. Every update carries a server-time revision, so
 * clients only ever move forward, even across function instances.
 */
const TTL_SECONDS = 12 * 60 * 60
const KINDS = ['position', 'look', 'linda', 'report', 'michael', 'run', 'sarah', 'm1039', 'james', 'drill'] as const
const ID = /^[A-Z0-9]{4,8}$/

type Entry = { json: string; rev: number }
type Redis = (command: (string | number)[]) => Promise<unknown>

const memory = new Map<string, Entry>()

/** Finds Upstash REST credentials under any prefix Vercel's integration used. */
function redis(): Redis | null {
  const urlKey = Object.keys(process.env).find(
    (k) => k.endsWith('KV_REST_API_URL') || k.endsWith('REDIS_REST_URL'),
  )
  const url = urlKey && process.env[urlKey]
  const token = urlKey && process.env[urlKey.replace(/URL$/, 'TOKEN')]
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

const reply = (body: unknown, store: string, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'x-session-store': store,
    },
  })

function sessionId(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.toUpperCase() ?? ''
  return ID.test(id) ? id : null
}

const key = (id: string, kind: string) => `session:${id}:${kind}`

export async function GET(request: Request) {
  const id = sessionId(request)
  const db = redis()
  const store = db ? 'redis' : 'memory'
  if (!id) return reply({ error: 'bad session id' }, store, 400)
  const keys = KINDS.map((k) => key(id, k))
  const values = db
    ? ((await db(['MGET', ...keys])) as (string | null)[]).map((v) => (v ? (JSON.parse(v) as Entry) : null))
    : keys.map((k) => memory.get(k) ?? null)
  return reply(Object.fromEntries(KINDS.map((k, i) => [k, values[i]])), store)
}

export async function POST(request: Request) {
  const id = sessionId(request)
  const db = redis()
  const store = db ? 'redis' : 'memory'
  if (!id) return reply({ error: 'bad session id' }, store, 400)
  const body = (await request.json()) as { kind?: string; json?: string }
  const valid =
    KINDS.includes(body.kind as (typeof KINDS)[number]) &&
    typeof body.json === 'string' &&
    body.json.length <= 2000
  if (!valid) return reply({ error: 'bad update' }, store, 400)
  const entry: Entry = { json: body.json as string, rev: Date.now() * 1000 + Math.floor(Math.random() * 1000) }
  const k = key(id, body.kind as string)
  if (db) await db(['SET', k, JSON.stringify(entry), 'EX', TTL_SECONDS])
  else memory.set(k, entry)
  return reply({ rev: entry.rev }, store)
}
