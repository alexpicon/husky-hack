/**
 * The code check every suggestion passes, wherever it came from. No runtime imports, so the
 * server function can use it as is.
 */

/** A suggested tap and the member's own words that support it. */
export type Suggestion = { id: string; quote: string }

/** The most of her text Skipper reads, sends or shares. */
export const MAX_TEXT = 500
const MAX_QUOTE = 160

export const clampText = (text: string) => text.trim().slice(0, MAX_TEXT)

/** Lower case, straight quotes, no accents or punctuation, single spaces. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/'/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

/** True when the quote's words appear in the text, whole words in a row. */
export function quoted(quote: string, text: string): boolean {
  const q = normalize(quote)
  return q.length > 0 && ` ${normalize(text)} `.includes(` ${q} `)
}

/**
 * Keeps only suggestions whose id is on the screen's list and whose quote is in her text, one
 * per id, in the list's order. Anything else in `raw` is dropped.
 */
export function verifySuggestions(raw: unknown, allowed: readonly string[], text: string): Suggestion[] {
  if (!Array.isArray(raw)) return []
  const said = clampText(text)
  const kept = new Map<string, Suggestion>()
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { id, quote } = item as Record<string, unknown>
    if (typeof id !== 'string' || typeof quote !== 'string') continue
    const words = quote.trim()
    if (!allowed.includes(id) || kept.has(id) || words.length > MAX_QUOTE) continue
    if (quoted(words, said)) kept.set(id, { id, quote: words })
  }
  return allowed.flatMap((id) => kept.get(id) ?? [])
}
