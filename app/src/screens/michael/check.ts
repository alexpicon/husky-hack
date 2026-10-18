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

/** Michael's answers on the pattern card, shared by every window. `v` counts edits; the newer copy wins. */
export type MichaelCheck = { v: number; taps: MichaelTap[]; shared: boolean }

export const initialCheck: MichaelCheck = { v: 0, taps: [], shared: false }

export const checkActions = {
  tap: (c: MichaelCheck, id: MichaelTap): MichaelCheck => ({ ...c, taps: toggleTap(c.taps, id) }),
  share: (c: MichaelCheck, shared: boolean): MichaelCheck => ({ ...c, shared }),
  reset: (c: MichaelCheck): MichaelCheck => ({ ...initialCheck, v: c.v }),
}

/** The same winner whichever window runs it: more edits first, then a fixed tie-break. */
export function mergeChecks(local: MichaelCheck, incoming: MichaelCheck): MichaelCheck {
  if (local.v !== incoming.v) return local.v > incoming.v ? local : incoming
  return JSON.stringify(local) >= JSON.stringify(incoming) ? local : incoming
}

/** What staff see: his taps only if he shares them. Marking his own account always shows, since it stops the card. */
export function staffView(c: MichaelCheck) {
  return { taps: c.shared ? c.taps : [], ownAccount: c.taps.includes('own') }
}
