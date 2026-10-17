/**
 * Shared demo sessions: laptops that join the same code see the same step.
 * State lives in Upstash Redis (Vercel Storage), one key per kind of state,
 * each stamped with a revision so clients never apply a stale reply.
 */
const TTL_SECONDS = 12 * 60 * 60
const KINDS = ['position', 'look'] as const
const ID = /^[A-Z0-9]{4,8}$/

const SET_WITH_REVISION = `
local rev = redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], ARGV[2])
redis.call('SET', KEYS[2], cjson.encode({ json = ARGV[1], rev = rev }), 'EX', ARGV[2])
return rev`

function store() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return async (command: (string | number)[]) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(command),
    })
    if (!res.ok) throw new Error(`Redis responded ${res.status}`)
    return ((await res.json()) as { result: unknown }).result
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

function sessionId(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.toUpperCase() ?? ''
  return ID.test(id) ? id : null
}

export async function GET(request: Request) {
  const id = sessionId(request)
  if (!id) return json({ error: 'bad session id' }, 400)
  const redis = store()
  if (!redis) return json({ error: 'session store not configured' }, 503)
  const values = (await redis(['MGET', ...KINDS.map((k) => `session:${id}:${k}`)])) as (string | null)[]
  const state = Object.fromEntries(KINDS.map((k, i) => [k, values[i] ? JSON.parse(values[i]) : null]))
  return json(state)
}

export async function POST(request: Request) {
  const id = sessionId(request)
  if (!id) return json({ error: 'bad session id' }, 400)
  const redis = store()
  if (!redis) return json({ error: 'session store not configured' }, 503)
  const body = (await request.json()) as { kind?: string; json?: string }
  if (!KINDS.includes(body.kind as (typeof KINDS)[number]) || typeof body.json !== 'string' || body.json.length > 2000) {
    return json({ error: 'bad update' }, 400)
  }
  const rev = await redis([
    'EVAL',
    SET_WITH_REVISION,
    2,
    `session:${id}:${body.kind}:rev`,
    `session:${id}:${body.kind}`,
    body.json,
    TTL_SECONDS,
  ])
  return json({ rev })
}
