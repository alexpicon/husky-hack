/**
 * The gate Skipper's AI must pass before SKIPPER_AI goes on: the eval set three times through the
 * same prompt and code check the server uses, against the keyword baseline. Run it with
 * `npm run skipper:eval`, with ANTHROPIC_API_KEY in app/.env.local or the shell. It calls the
 * Anthropic API about 280 times.
 */
import { DEFAULT_MODEL, runCall, tapsCall } from '../src/skipper/ai.ts'
import { PHRASINGS, type Phrasing } from '../src/skipper/eval/phrasings.ts'
import { gate, measure, type Answer, type Metrics } from '../src/skipper/eval/score.ts'
import { matchKeywords } from '../src/skipper/keyword.ts'
import { allowedIds, SKIPPER_LISTS } from '../src/skipper/lists.ts'
import { verifySuggestions } from '../src/skipper/verify.ts'

const RUNS = 3
const PARALLEL = 4
const TIMEOUT_MS = 4000
const key = process.env.ANTHROPIC_API_KEY ?? ''
const model = process.env.SKIPPER_MODEL || DEFAULT_MODEL
let failures = 0

async function ask(row: Phrasing): Promise<Answer> {
  const allowed = allowedIds(row.screen)
  const start = performance.now()
  try {
    const input = await runCall(tapsCall(row.text, SKIPPER_LISTS[row.screen]), {
      key,
      model,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const said = input?.taps
    const raw: unknown[] = Array.isArray(said) ? said : []
    const outside = raw.filter((t) => !allowed.includes(String((t as { id?: unknown } | null)?.id))).length
    const taps = verifySuggestions(raw, allowed, row.text).map((s) => s.id)
    return { id: row.id, taps, outside, ms: performance.now() - start }
  } catch {
    failures += 1
    return { id: row.id, taps: [], outside: 0, ms: performance.now() - start }
  }
}

async function pool<T, R>(items: readonly T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await work(items[i])
    }
  }
  await Promise.all(Array.from({ length: size }, worker))
  return out
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`
const num = (n: number) => n.toFixed(3)

function table(ai: Metrics | null, kw: Metrics) {
  const rows: [string, (m: Metrics) => string][] = [
    ['Answers outside the list', (m) => String(m.outside)],
    ['Honest phrasings with 2+ signal taps', (m) => String(m.honestFlagged)],
    ['Injection rows with a changed result', (m) => String(m.injectionChanged)],
    ['"Talk privately" caught', (m) => pct(m.privateCaught)],
    ['Precision', (m) => num(m.precision)],
    ['Recall', (m) => num(m.recall)],
    ['Exact-set match', (m) => pct(m.exact)],
    ['p95 latency', (m) => `${Math.round(m.p95Ms)} ms`],
  ]
  console.log(`${''.padEnd(40)}${'AI'.padEnd(14)}Keywords`)
  for (const [label, show] of rows) console.log(`${label.padEnd(40)}${(ai ? show(ai) : '-').padEnd(14)}${show(kw)}`)
}

const setOf = (ids: readonly string[]) => [...ids].sort().join(', ')

function misses(runs: Answer[][]) {
  for (const row of PHRASINGS) {
    const got = runs.map((run) => run.find((a) => a.id === row.id)?.taps ?? [])
    if (got.every((taps) => setOf(taps) === setOf(row.expect))) continue
    console.log(`  ${row.id.padEnd(4)} ${row.kind.padEnd(12)} expected [${setOf(row.expect)}] got ${got.map((t) => `[${setOf(t)}]`).join(' ')}`)
  }
}

const baseline = PHRASINGS.map((row) => ({
  id: row.id,
  taps: matchKeywords(row.screen, row.text).map((s) => s.id),
  outside: 0,
  ms: 0,
}))
const keywords = measure([baseline])
console.log(`Skipper eval: ${PHRASINGS.length} phrasings, ${RUNS} runs of ${model}, against the keyword baseline\n`)

if (!key) {
  table(null, keywords)
  console.log('\nNo ANTHROPIC_API_KEY, so the AI was not evaluated.\nRESULT: FAIL (not run). Skipper stays on keywords.')
  process.exitCode = 1
} else {
  const runs: Answer[][] = []
  for (let i = 0; i < RUNS; i++) runs.push(await pool(PHRASINGS, PARALLEL, ask))
  const ai = measure(runs)
  table(ai, keywords)
  console.log(`\nCalls that failed or timed out: ${failures} of ${PHRASINGS.length * RUNS}`)
  console.log('\nRows the AI got wrong in any run:')
  misses(runs)
  const checks = gate(ai, keywords)
  console.log('\nGate:')
  for (const [check, ok] of checks) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${check}`)
  const pass = checks.every(([, ok]) => ok)
  console.log(
    pass
      ? '\nRESULT: PASS. Set SKIPPER_AI=on in Vercel (and app/.env.local for dev) to turn the AI on.'
      : '\nRESULT: FAIL. Keep SKIPPER_AI=off: Skipper stays on keywords.',
  )
  process.exitCode = pass ? 0 : 1
}
