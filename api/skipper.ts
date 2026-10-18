/**
 * Skipper's AI, behind Sound's own server: the key never reaches a browser. Off unless the
 * project sets ANTHROPIC_API_KEY and SKIPPER_AI=on; while off, the app matches words to its list
 * on the device. Her text is read once and never logged or stored.
 */
import { noteCall, runCall, tapsCall } from '../app/src/skipper/ai'
import { allowedIds, isScreen, SKIPPER_LISTS } from '../app/src/skipper/lists'
import { checkNote } from '../app/src/skipper/note'
import { clampText, verifySuggestions } from '../app/src/skipper/verify'

const SERVER_TIMEOUT_MS = 4000
const MAX_BODY = 4000
const PER_MINUTE = 30
const WINDOW_MS = 60_000

const recent = new Map<string, { since: number; count: number }>()

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

/** Read through globalThis, so the app's type check (which has no Node types) can test this file. */
const env = () => (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}

function key() {
  const k = env().ANTHROPIC_API_KEY
  return k && env().SKIPPER_AI === 'on' ? k : null
}

/** A simple per-address limit, so one open page cannot run up the bill. */
function allowed(request: Request, now = Date.now()) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (recent.size > 5000) recent.clear()
  const seen = recent.get(ip)
  if (!seen || now - seen.since > WINDOW_MS) {
    recent.set(ip, { since: now, count: 1 })
    return true
  }
  seen.count += 1
  return seen.count <= PER_MINUTE
}

export function GET() {
  return reply({ mode: key() ? 'ai' : 'keywords' })
}

export async function POST(request: Request) {
  const apiKey = key()
  if (!apiKey) return reply({ mode: 'keywords' }, 503)
  if (!allowed(request)) return reply({ mode: 'keywords', error: 'busy' }, 429)

  const raw = await request.text()
  let body: { mode?: unknown; screen?: unknown; text?: unknown }
  try {
    body = raw.length <= MAX_BODY ? JSON.parse(raw) : {}
  } catch {
    body = {}
  }
  const text = typeof body.text === 'string' ? clampText(body.text) : ''
  if (!text) return reply({ error: 'bad request' }, 400)

  const options = {
    key: apiKey,
    model: env().SKIPPER_MODEL || undefined,
    signal: AbortSignal.timeout(SERVER_TIMEOUT_MS),
  }
  try {
    if (body.mode === 'taps' && isScreen(body.screen)) {
      const input = await runCall(tapsCall(text, SKIPPER_LISTS[body.screen]), options)
      const taps = verifySuggestions(input?.taps, allowedIds(body.screen), text)
      return reply({ taps, source: 'ai' })
    }
    if (body.mode === 'note') {
      const input = await runCall(noteCall(text), options)
      return reply({ note: checkNote(input?.note) })
    }
  } catch {
    return reply({ mode: 'keywords' }, 502)
  }
  return reply({ error: 'bad request' }, 400)
}
