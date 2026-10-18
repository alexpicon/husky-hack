import { createContext, useContext } from 'react'
import { TAP_OPTIONS, toggleTap, type TapId } from './taps'

/** How the held wire ends. Once set it never changes, whoever clicks what afterwards. */
export type OutcomeKind = 'cancelled' | 'sent' | 'help' | 'no-response'
export type Outcome = { kind: OutcomeKind; at: number; reason?: string }
export type StaffAction = 'holding' | 'escalated' | 'case-opened'

/**
 * One wire hold. Every window showing Linda's story has the same case, except what she hasn't
 * shared (see `outbound`). `run` is the demo run it belongs to and `round` grows on each reset, so
 * a fresh case beats an old one; `v` counts edits so the newer copy of a field wins. `mv` counts
 * only her own answers and her share switch, so no staff click can overwrite her choices.
 */
export type LindaCase = {
  run: number
  round: number
  v: number
  mv: number
  taps: TapId[]
  skipped: boolean
  shared: boolean
  wantsToSend: boolean
  outcome: Outcome | null
  staffActions: StaffAction[]
}

export const initialCase: LindaCase = {
  run: 0,
  round: 0,
  v: 0,
  mv: 0,
  taps: [],
  skipped: false,
  shared: false,
  wantsToSend: false,
  outcome: null,
  staffActions: [],
}

/** When two windows finish the case differently at once, the ending that keeps the money wins. */
const SAFEST_FIRST: OutcomeKind[] = ['cancelled', 'help', 'no-response', 'sent']
const STAFF_ORDER: StaffAction[] = ['holding', 'escalated', 'case-opened']

const final = (c: LindaCase) => c.outcome !== null
const fresh = (c: LindaCase, run: number): LindaCase => ({ ...initialCase, run, round: c.round + 1 })

export const caseActions = {
  tap: (c: LindaCase, id: TapId): LindaCase => ({
    ...c,
    mv: c.mv + 1,
    taps: toggleTap(c.taps, id),
    skipped: false,
  }),
  /** Taps each listed answer that is off, in order, by the same rules; one already on stays on. */
  addTaps: (c: LindaCase, ids: readonly TapId[]): LindaCase => {
    const taps = ids.reduce((on, id) => (on.includes(id) ? on : toggleTap(on, id)), c.taps)
    return taps === c.taps ? c : { ...c, mv: c.mv + 1, taps, skipped: false }
  },
  finishCheck: (c: LindaCase): LindaCase => ({ ...c, mv: c.mv + 1, skipped: c.taps.length === 0 }),
  share: (c: LindaCase, shared: boolean): LindaCase => ({ ...c, mv: c.mv + 1, shared }),
  askToSend: (c: LindaCase): LindaCase => (final(c) ? c : { ...c, wantsToSend: true }),
  decide: (c: LindaCase, kind: OutcomeKind, at: Date, reason?: string): LindaCase =>
    final(c) ? c : { ...c, outcome: { kind, at: at.getTime(), ...(reason ? { reason } : {}) } },
  staff: (c: LindaCase, action: StaffAction): LindaCase => {
    if (c.staffActions.includes(action) || (action === 'holding' && final(c))) return c
    const staffActions = STAFF_ORDER.filter((a) => a === action || c.staffActions.includes(a))
    return { ...c, staffActions }
  },
  reset: (c: LindaCase): LindaCase => fresh(c, c.run),
  /** A fresh case for a later demo run; a case already in that run stays. */
  startRun: (c: LindaCase, run: number): LindaCase => (c.run < run ? fresh(c, run) : c),
}

/** Picks the same one of two copies whichever is passed first. */
function larger<T>(a: T, b: T): T {
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b
}

function pickOutcome(a: Outcome | null, b: Outcome | null): Outcome | null {
  if (!a || !b) return a ?? b
  const rank = (o: Outcome) => SAFEST_FIRST.indexOf(o.kind)
  if (a.kind !== b.kind) return rank(a) < rank(b) ? a : b
  return a.at !== b.at ? (a.at < b.at ? a : b) : larger(a, b)
}

/** The copy with her latest answers or share switch; on a tie, the one that does not share. */
function herLatest(a: LindaCase, b: LindaCase): LindaCase | null {
  if (a.mv !== b.mv) return a.mv > b.mv ? a : b
  if (a.shared !== b.shared) return a.shared ? b : a
  return null
}

/**
 * Combines this window's case with one another window sent. The result is the same whichever
 * side runs it, so every window settles on one case: a later run, then a later round, replaces the
 * case; within a round the more-edited copy wins, an outcome is never undone, and staff actions add up.
 * Her answers and her share switch come from her own latest edit, so a staff click never undoes them.
 */
export function mergeCases(local: LindaCase, incoming: LindaCase): LindaCase {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  if (local.round !== incoming.round) return local.round > incoming.round ? local : incoming
  const base =
    local.v === incoming.v ? larger(local, incoming) : local.v > incoming.v ? local : incoming
  const hers = herLatest(local, incoming) ?? base
  return {
    ...base,
    v: Math.max(local.v, incoming.v),
    mv: hers.mv,
    taps: hers.taps,
    skipped: hers.skipped,
    shared: hers.shared,
    wantsToSend: local.wantsToSend || incoming.wantsToSend,
    outcome: pickOutcome(local.outcome, incoming.outcome),
    staffActions: STAFF_ORDER.filter(
      (a) => local.staffActions.includes(a) || incoming.staffActions.includes(a),
    ),
  }
}

/**
 * The only copy that leaves this window: her taps, and whether she skipped them, only while she
 * shares. Staff can't tell skipping from not sharing. Asking to talk privately always goes, since
 * staff always see it.
 */
export function outbound(c: LindaCase): LindaCase {
  return c.shared ? c : { ...c, taps: c.taps.filter((t) => t === 'private'), skipped: false }
}

/**
 * Takes another window's outbound copy. Every window settles on the same shared case, and her
 * unshared answers stay in the window where she gave them. A new run or round clears them, and so
 * does a copy that stops sharing: the taps it shared before leave every other window.
 */
export function receiveCase(local: LindaCase, incoming: LindaCase): LindaCase {
  const merged = mergeCases(outbound(local), incoming)
  const sameCase = merged.run === local.run && merged.round === local.round
  if (!sameCase || merged.shared || local.shared) return merged
  const taps = TAP_OPTIONS.map((o) => o.id).filter((t) =>
    (t === 'private' ? merged : local).taps.includes(t),
  )
  return { ...merged, taps, skipped: local.skipped }
}

type Api = {
  state: LindaCase
  update: (change: (c: LindaCase) => LindaCase) => void
}

export const LindaCaseContext = createContext<Api>({ state: initialCase, update: () => {} })

/** Linda's shared case and a way to change it with one of `caseActions`. */
export const useLindaCase = () => useContext(LindaCaseContext)
