import { Ban, Coins, HandCoins, Landmark, Lock, UserRoundX, type LucideIcon } from 'lucide-react'
import { MIN_FITTING_TAPS } from '../linda/scams'

export type MichaelTap = 'never-met' | 'investment' | 'secret' | 'emergency' | 'none' | 'own'

/** signal: how a romance scam often works. none and own: an answer that points to no scam. */
export type MichaelTapKind = 'signal' | 'none' | 'own'

export type MichaelOption = { id: MichaelTap; label: string; icon: LucideIcon; kind: MichaelTapKind }

export const ROMANCE_OPTIONS: MichaelOption[] = [
  { id: 'never-met', label: "We've never met in person", icon: UserRoundX, kind: 'signal' },
  { id: 'investment', label: 'They talked about an investment or crypto', icon: Coins, kind: 'signal' },
  { id: 'secret', label: 'They asked me to keep this from family or friends', icon: Lock, kind: 'signal' },
  { id: 'emergency', label: 'They need money for an emergency or a fee', icon: HandCoins, kind: 'signal' },
  { id: 'none', label: 'None of these', icon: Ban, kind: 'none' },
  { id: 'own', label: 'This is my own account', icon: Landmark, kind: 'own' },
]

const kindOf = (id: MichaelTap) => ROMANCE_OPTIONS.find((o) => o.id === id)?.kind

/** "None of these" and "my own account" each stand alone; any signal clears them. */
export function toggleTap(taps: readonly MichaelTap[], id: MichaelTap): MichaelTap[] {
  let on: MichaelTap[]
  if (taps.includes(id)) on = taps.filter((t) => t !== id)
  else if (kindOf(id) === 'signal') on = [...taps.filter((t) => kindOf(t) === 'signal'), id]
  else on = [id]
  return ROMANCE_OPTIONS.map((o) => o.id).filter((t) => on.includes(t))
}

/** The signals he tapped, when there are enough of them to name the scam. One is never enough. */
export function romanceFit(taps: readonly MichaelTap[]): MichaelTap[] | null {
  const fitting = taps.filter((t) => kindOf(t) === 'signal')
  return fitting.length >= MIN_FITTING_TAPS ? fitting : null
}

/** His choice on the card: send the 4th payment, or "Not now", which sends nothing. */
export type CardChoice = 'send' | 'not-now'

/** His choice on the held wire: wait for Sound's call, or cancel it. */
export type WireChoice = 'wait' | 'cancel'

/** His answer on the held wire to "Have you been able to withdraw from the platform?" */
export type TestAnswer = 'worked' | 'failed' | 'untried'

/** No answer clears the hold or skips the call: a fake platform can let a little out early. */
export const TEST_OPTIONS: { id: TestAnswer; label: string; reply: string }[] = [
  {
    id: 'worked',
    label: 'Yes, I took money out',
    reply: 'Thanks. Some fake platforms let a little out early to win trust, so a specialist will still call you.',
  },
  {
    id: 'failed',
    label: 'No, or they asked for a fee first',
    reply: "That's how these scams keep you paying. Your wire stays on hold, and a specialist will call you.",
  },
  { id: 'untried', label: "I haven't tried", reply: "That's OK. Your wire stays on hold, and a specialist will call you." },
]

/**
 * Michael's answers on the pattern card and the held wire, shared by every window. `run` is the
 * demo run they belong to and `v` counts edits; a newer run wins, then the newer copy.
 */
export type MichaelCheck = {
  run: number
  v: number
  taps: MichaelTap[]
  shared: boolean
  card: CardChoice | null
  wire: WireChoice | null
  test: TestAnswer | null
}

export const initialCheck: MichaelCheck = { run: 0, v: 0, taps: [], shared: false, card: null, wire: null, test: null }

export const checkActions = {
  tap: (c: MichaelCheck, id: MichaelTap): MichaelCheck => ({ ...c, taps: toggleTap(c.taps, id) }),
  share: (c: MichaelCheck, shared: boolean): MichaelCheck => ({ ...c, shared }),
  /** Each choice is final once given: a second window's late tap never changes it. */
  card: (c: MichaelCheck, card: CardChoice): MichaelCheck => (c.card ? c : { ...c, card }),
  wire: (c: MichaelCheck, wire: WireChoice): MichaelCheck => (c.wire ? c : { ...c, wire }),
  /** A cancelled wire locks the test: it only ever mattered for the call about that wire. */
  test: (c: MichaelCheck, test: TestAnswer): MichaelCheck => (c.test || c.wire === 'cancel' ? c : { ...c, test }),
  reset: (c: MichaelCheck): MichaelCheck => ({ ...initialCheck, run: c.run, v: c.v }),
  /** A new demo run starts him over; a window still on an older run never clears a newer one. */
  forRun: (c: MichaelCheck, run: number): MichaelCheck => (run > c.run ? { ...initialCheck, run, v: c.v } : c),
}

/** The same winner whichever window runs it: the newer run, then more edits, then a fixed tie-break. */
export function mergeChecks(local: MichaelCheck, incoming: MichaelCheck): MichaelCheck {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  if (local.v !== incoming.v) return local.v > incoming.v ? local : incoming
  return JSON.stringify(local) >= JSON.stringify(incoming) ? local : incoming
}

/**
 * What staff see: his taps and his withdrawal-test answer only if he shares them. Marking his own
 * account always shows, since it stops the card.
 */
export function staffView(c: MichaelCheck) {
  return { taps: c.shared ? c.taps : [], ownAccount: c.taps.includes('own'), test: c.shared ? c.test : null }
}
