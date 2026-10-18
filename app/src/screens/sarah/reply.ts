import type { TakeoverStage } from '../staff/TakeoverCase'
import { yesReleases } from '../staff/takeoverStages'

export type SarahAnswer = 'yes' | 'no'

/**
 * Sarah's reply to "Was this you?", shared by every window. `v` counts edits and the newer copy
 * wins; `run` is the demo run it belongs to; `callback` is set once a specialist reached her on the
 * number on file before the change and she confirmed.
 */
export type SarahReply = { v: number; run: number; answer: SarahAnswer | null; callback: boolean }

export const initialReply: SarahReply = { v: 0, run: 0, answer: null, callback: false }

/** A reply from an earlier demo run counts as no reply. */
export const inRun = (r: SarahReply, run: number): SarahReply =>
  r.run === run ? r : { ...initialReply, v: r.v, run }

export const replyActions = {
  /** Her first answer stands: once she taps, both buttons lock. */
  answer: (r: SarahReply, answer: SarahAnswer): SarahReply => (r.answer ? r : { ...r, answer }),
  callbackDone: (r: SarahReply): SarahReply =>
    r.answer === 'yes' && !r.callback ? { ...r, callback: true } : r,
  reset: (r: SarahReply): SarahReply => ({ ...initialReply, v: r.v, run: r.run }),
}

/** The same winner whichever window runs it: a later run, then more edits, then a fixed tie-break. */
export function mergeReplies(local: SarahReply, incoming: SarahReply): SarahReply {
  if (local.run !== incoming.run) return local.run > incoming.run ? local : incoming
  if (local.v !== incoming.v) return local.v > incoming.v ? local : incoming
  return JSON.stringify(local) >= JSON.stringify(incoming) ? local : incoming
}

/** Her payment went out: a YES alone under POLICY.fullStopRelease 'yes', a YES and the callback under 'callback'. */
export const released = (r: SarahReply) => r.answer === 'yes' && (yesReleases(true) || r.callback)

/** The steps that come after the question, in the story's order. */
export type ReplyStep = 'asked' | 'not-me' | 'secured'

/**
 * The staff case at each step. After a YES that has not released the payment, the not-me and
 * secured steps are the specialist's callback hearing that it was not her.
 */
export function caseStage(step: ReplyStep, r: SarahReply): TakeoverStage {
  if (released(r)) return 'released'
  if (step !== 'asked') return step
  if (r.answer === 'no') return 'not-me'
  return r.answer === 'yes' ? 'its-me' : 'asked'
}
