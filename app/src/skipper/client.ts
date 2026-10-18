import { matchKeywords } from './keyword.ts'
import { allowedIds, type SkipperScreen } from './lists.ts'
import { checkNote } from './note.ts'
import { clampText, verifySuggestions, type Suggestion } from './verify.ts'

/** ai: her words go to Sound's server and an AI provider. keywords: they stay on this device. */
export type SkipperMode = 'ai' | 'keywords'

export type Suggested = { taps: Suggestion[]; source: SkipperMode }

export const BROWSER_TIMEOUT_MS = 3500
const ENDPOINT = '/api/skipper'

let modeOnce: Promise<SkipperMode> | null = null

/** Whether the server has the AI switched on, asked once per page. Any failure means keywords. */
export function skipperMode(): Promise<SkipperMode> {
  modeOnce ??= fetch(ENDPOINT, { cache: 'no-store', signal: AbortSignal.timeout(BROWSER_TIMEOUT_MS) })
    .then((res) => (res.ok ? res.json() : null))
    .then((body: { mode?: unknown } | null): SkipperMode => (body?.mode === 'ai' ? 'ai' : 'keywords'))
    .catch((): SkipperMode => 'keywords')
  return modeOnce
}

/** Forgets the server's answer, so the next call asks again. */
export const resetSkipperMode = () => {
  modeOnce = null
}

async function ask(body: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(BROWSER_TIMEOUT_MS),
  })
  return res.ok ? ((await res.json()) as Record<string, unknown>) : null
}

/**
 * The taps her words support on this screen, each with her own words, checked again here. Pass
 * the mode the screen's privacy line showed: in keyword mode her words never leave the device.
 * On any failure or timeout it falls back to keywords.
 */
export async function suggestTaps(screen: SkipperScreen, text: string, mode?: SkipperMode): Promise<Suggested> {
  const said = clampText(text)
  const keywords = (): Suggested => ({ taps: matchKeywords(screen, said), source: 'keywords' })
  if (!said || (mode ?? (await skipperMode())) !== 'ai') return keywords()
  try {
    const body = await ask({ mode: 'taps', screen, text: said })
    return body ? { taps: verifySuggestions(body.taps, allowedIds(screen), said), source: 'ai' } : keywords()
  } catch {
    return keywords()
  }
}

const notes = new Map<string, Promise<string | null>>()

/**
 * Skipper's 1-2 sentence note for staff, drafted only from her words, or null when the AI is off,
 * fails, times out or writes something the check refuses. Call it only once she shares.
 */
export function draftNote(text: string, mode?: SkipperMode): Promise<string | null> {
  const said = clampText(text)
  if (!said) return Promise.resolve(null)
  const key = `${mode ?? ''}:${said}`
  const cached = notes.get(key)
  if (cached) return cached
  if (notes.size > 20) notes.clear()
  const note = (async () => {
    if ((mode ?? (await skipperMode())) !== 'ai') return null
    try {
      return checkNote((await ask({ mode: 'note', text: said }))?.note)
    } catch {
      return null
    }
  })()
  notes.set(key, note)
  return note
}
