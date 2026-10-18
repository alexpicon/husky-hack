import type { AgentChoice } from './agent'
import { toggleJamesTap, type JamesTapId } from './copy'

/** The teller's buttons on the heads-up. Escalating and continuing each end it. */
export type TellerAction = 'ask' | 'tablet' | 'escalate' | 'continue'

export const ENDS: readonly TellerAction[] = ['escalate', 'continue']

/**
 * The contact center agent's choice at step one, James's taps and the teller's choices at step
 * two. Every window has the same answers except his taps (see `outbound`). `run` is the demo run
 * they belong to; `v` counts edits in that run, and the newer copy wins.
 */
export type JamesAnswers = {
  run: number
  v: number
  agent: AgentChoice | null
  taps: JamesTapId[]
  teller: TellerAction[]
}

export const initialAnswers: JamesAnswers = { run: 0, v: 0, agent: null, taps: [], teller: [] }

export const answerActions = {
  /** The agent logs one outcome per call, and it stands. */
  agent: (a: JamesAnswers, id: AgentChoice): JamesAnswers => (a.agent ? a : { ...a, agent: id }),
  /** Once the teller goes on with the withdrawal, his taps stand as they were. */
  tap: (a: JamesAnswers, id: JamesTapId): JamesAnswers =>
    a.teller.includes('continue') ? a : { ...a, taps: toggleJamesTap(a.taps, id) },
  /** Taps each listed answer that is off, in order, by the same rules; one already on stays on. */
  addTaps: (a: JamesAnswers, ids: readonly JamesTapId[]): JamesAnswers => {
    if (a.teller.includes('continue')) return a
    const taps = ids.reduce((on, id) => (on.includes(id) ? on : toggleJamesTap(on, id)), a.taps)
    return taps === a.taps ? a : { ...a, taps }
  },
  teller: (a: JamesAnswers, id: TellerAction): JamesAnswers => {
    if (a.teller.includes(id)) return a
    if (ENDS.includes(id) && a.teller.some((t) => ENDS.includes(t))) return a
    return { ...a, teller: [...a.teller, id] }
  },
  reset: (a: JamesAnswers): JamesAnswers => ({ ...initialAnswers, run: a.run, v: a.v }),
}

/** The same winner whichever window runs it: a later run, then more edits, then a fixed tie-break. */
export function mergeAnswers(local: JamesAnswers, incoming: JamesAnswers): JamesAnswers {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  if (local.v !== incoming.v) return local.v > incoming.v ? local : incoming
  return JSON.stringify(local) >= JSON.stringify(incoming) ? local : incoming
}

/** The only copy that leaves this window: no staff screen shows his taps, so they never go. */
export const outbound = (a: JamesAnswers): JamesAnswers => ({ ...a, taps: [] })

/**
 * Takes another window's outbound copy. Every window settles on the same agent and teller choices,
 * and his taps stay in the window where he gave them until a new run.
 */
export function mergeOutbound(local: JamesAnswers, incoming: JamesAnswers): JamesAnswers {
  if (mergeAnswers(outbound(local), incoming) !== incoming) return local
  return incoming.run === local.run ? { ...incoming, taps: local.taps } : incoming
}

/** The teller went on with the withdrawal, so the cash was handed over. */
export const handedOver = (a: JamesAnswers) => a.teller.includes('continue')
