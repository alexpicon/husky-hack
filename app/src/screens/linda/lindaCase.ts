import { createContext, useContext } from 'react'
import { toggleTap, type TapId } from './taps'

/** How the held wire ends. Once set it never changes, whoever clicks what afterwards. */
export type OutcomeKind = 'cancelled' | 'sent' | 'help' | 'no-response'
export type Outcome = { kind: OutcomeKind; at: number; reason?: string }
export type StaffAction = 'holding' | 'escalated' | 'case-opened'

/**
 * One wire hold, shared by every window showing Linda's story. `round` grows on each reset so
 * a fresh case beats an old one; `v` counts edits so the newer copy of a field wins.
 */
export type LindaCase = {
  round: number
  v: number
  taps: TapId[]
  skipped: boolean
  shared: boolean
  wantsToSend: boolean
  outcome: Outcome | null
  staffActions: StaffAction[]
}

export const initialCase: LindaCase = {
  round: 0,
  v: 0,
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

export const caseActions = {
  tap: (c: LindaCase, id: TapId): LindaCase => ({
    ...c,
    taps: toggleTap(c.taps, id),
    skipped: false,
  }),
  finishCheck: (c: LindaCase): LindaCase => ({ ...c, skipped: c.taps.length === 0 }),
  share: (c: LindaCase, shared: boolean): LindaCase => ({ ...c, shared }),
  askToSend: (c: LindaCase): LindaCase => (final(c) ? c : { ...c, wantsToSend: true }),
  decide: (c: LindaCase, kind: OutcomeKind, at: Date, reason?: string): LindaCase =>
    final(c) ? c : { ...c, outcome: { kind, at: at.getTime(), ...(reason ? { reason } : {}) } },
  staff: (c: LindaCase, action: StaffAction): LindaCase => {
    if (c.staffActions.includes(action) || (action === 'holding' && final(c))) return c
    const staffActions = STAFF_ORDER.filter((a) => a === action || c.staffActions.includes(a))
    return { ...c, staffActions }
  },
  reset: (c: LindaCase): LindaCase => ({ ...initialCase, round: c.round + 1 }),
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

/**
 * Combines this window's case with one another window sent. The result is the same whichever
 * side runs it, so every window settles on one case: a later round replaces the case; within a
 * round the more-edited copy wins, an outcome is never undone, and staff actions add up.
 */
export function mergeCases(local: LindaCase, incoming: LindaCase): LindaCase {
  if (local.round !== incoming.round) return local.round > incoming.round ? local : incoming
  const base =
    local.v === incoming.v ? larger(local, incoming) : local.v > incoming.v ? local : incoming
  return {
    ...base,
    v: Math.max(local.v, incoming.v),
    wantsToSend: local.wantsToSend || incoming.wantsToSend,
    outcome: pickOutcome(local.outcome, incoming.outcome),
    staffActions: STAFF_ORDER.filter(
      (a) => local.staffActions.includes(a) || incoming.staffActions.includes(a),
    ),
  }
}

type Api = {
  state: LindaCase
  update: (change: (c: LindaCase) => LindaCase) => void
}

export const LindaCaseContext = createContext<Api>({ state: initialCase, update: () => {} })

/** Linda's shared case and a way to change it with one of `caseActions`. */
export const useLindaCase = () => useContext(LindaCaseContext)
