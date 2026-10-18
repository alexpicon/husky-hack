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

/** A tap on the panel list: `group.tap`, under its scam. */
export type GroupTap = { id: string; group: PanelGroup }

/**
 * Taps that fit more than one story, so they never break a tie: more than one check asks about
 * secrecy and coaching, and an officer or detective turns up in the government story too.
 */
export const COMMON_TAPS: readonly string[] = ['secret', 'coached', 'official']

export const bareId = (id: string) => id.slice(id.indexOf('.') + 1)

/**
 * The scams her taps fit best: the most taps, then, among those tied, the most taps no other
 * story shares. A tie with the grandparent story goes to it, since the phone asks what the
 * grandson said. More than one group back means a tie that names none.
 */
export function leadingGroups(taps: readonly GroupTap[]): PanelGroup[] {
  const scored = PANEL_GROUPS.map((group) => {
    const mine = taps.filter((t) => t.group === group)
    return { group, n: mine.length, own: mine.filter((t) => !COMMON_TAPS.includes(bareId(t.id))).length }
  })
  const top = Math.max(...scored.map((s) => s.n))
  const tied = scored.filter((s) => s.n === top)
  const best = Math.max(...tied.map((s) => s.own))
  const leaders = tied.filter((s) => s.own === best).map((s) => s.group)
  return leaders.includes('grandparent') ? ['grandparent'] : leaders
}

/** The wall's result for the taps she confirmed: one leading group with 2 or more taps names its scam. */
export function resultFor(taps: readonly GroupTap[]): string {
  const [lead, ...tied] = leadingGroups(taps)
  const n = taps.filter((t) => t.group === lead).length
  return n >= MIN_FITTING_TAPS && tied.length === 0 ? GROUP_RESULTS[lead] : NO_PATTERN
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
