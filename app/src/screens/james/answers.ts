import type { AgentChoice } from './agent'
import { toggleJamesTap, type JamesTapId } from './copy'

/** The teller's buttons on the heads-up. Escalating and continuing each end it. */
export type TellerAction = 'ask' | 'tablet' | 'escalate' | 'continue'

export const ENDS: readonly TellerAction[] = ['escalate', 'continue']

/**
 * The contact center agent's choice at step one, James's taps and the teller's choices at step
 * two, shared by every window. `run` is the demo run they belong to; `v` counts edits in that
 * run, and the newer copy wins.
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

/** The teller went on with the withdrawal, so the cash was handed over. */
export const handedOver = (a: JamesAnswers) => a.teller.includes('continue')
