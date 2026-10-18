/**
 * What may reach the panel wall, shared by the phone page, the wall and the dev server.
 * No imports on purpose: the dev server loads this file under Node's own module rules.
 */

/** The scams the wall can name, one per story. */
export type PanelGroup = 'grandparent' | 'government' | 'romance'

export const PANEL_GROUPS: readonly PanelGroup[] = ['grandparent', 'government', 'romance']

/** What each scam's story does about it, so the wall says what happens next, not a verdict. */
export const GROUP_RESULTS: Record<PanelGroup, string> = {
  grandparent: 'fits grandparent scam · wire held',
  government: 'fits government scam · teller heads-up',
  romance: 'fits relationship investment scam · every wire gets a call',
}

/** Never an all-clear: without one pattern, a person still checks. */
export const NO_PATTERN = "doesn't fit one pattern · a person still checks"

/** The only results the wall accepts. */
export const PANEL_RESULTS: readonly string[] = [...PANEL_GROUPS.map((g) => GROUP_RESULTS[g]), NO_PATTERN]

export const isPanelResult = (value: unknown): value is string =>
  typeof value === 'string' && PANEL_RESULTS.includes(value)

/** One tap is never enough to name a scam, as in every story's silent check. */
export const MIN_FITTING_TAPS = 2

/**
 * The wall's result for the scam group of each tap she confirmed. A group names its scam
 * with 2 or more taps and more than any other group; a tie names none.
 */
export function resultFor(groups: readonly PanelGroup[]): string {
  const counts = PANEL_GROUPS.map((g) => ({ g, n: groups.filter((x) => x === g).length }))
  const top = Math.max(...counts.map((c) => c.n))
  const leaders = counts.filter((c) => c.n === top)
  return top >= MIN_FITTING_TAPS && leaders.length === 1 ? GROUP_RESULTS[leaders[0].g] : NO_PATTERN
}

export const QUOTE_MAX = 40

/** One line of what she typed, cut to 40 characters. The full text never leaves her phone. */
export function clipQuote(text: string): string {
  const chars = Array.from(text.replace(/\p{Cc}/gu, ' ').replace(/\s+/g, ' ').trim())
  return chars.length > QUOTE_MAX ? `${chars.slice(0, QUOTE_MAX).join('').trimEnd()}…` : chars.join('')
}

/** A wall code, like a session code. */
export const WALL_CODE = /^[A-Z0-9]{4,8}$/

/** An optional label in place of "Judge N", such as the presenter's own entry. */
export const JUDGE_LABEL = /^[A-Za-z0-9 ]{1,20}$/

/** One line on the wall. n counts every post to the code, so numbers stay put as old lines drop off. */
export type PanelEntry = { n: number; quote: string; result: string; judge?: string }

export const WALL_LIMITS = {
  /** Lines the wall keeps, newest last. */
  keep: 40,
  /** Posts a code takes in all. */
  perCode: 120,
  /** Posts one address may make per window; a venue's judges often share one Wi-Fi address. */
  perIp: 15,
  ipWindowSeconds: 60,
  /** The wall is gone a few hours after the demo. */
  ttlSeconds: 6 * 60 * 60,
} as const
