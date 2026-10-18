import { POLICY } from '../../data/policy'
import type { Tone } from '../../ui/primitives'
import type { ActionLook } from './parts'
import type { TakeoverStage } from './TakeoverCase'

export const stagePill: Record<TakeoverStage, { label: string; tone: Tone; live?: boolean }> = {
  watching: { label: 'Watching', tone: 'neutral', live: true },
  paused: { label: 'Payment paused', tone: 'warn' },
  asked: { label: 'Waiting for member', tone: 'warn', live: true },
  'not-me': { label: 'Member said NO', tone: 'danger' },
  secured: { label: 'Secured', tone: 'safe' },
  'its-me': { label: 'Member confirmed', tone: 'safe' },
  released: { label: 'Released', tone: 'safe' },
}

export type TakeoverAction = 'release' | 'lock' | 'recover'

export const actionPlan: Record<TakeoverStage, Record<TakeoverAction, ActionLook>> = {
  watching: { release: 'off', lock: 'off', recover: 'off' },
  paused: { release: 'off', lock: 'off', recover: 'off' },
  asked: { release: 'off', lock: 'off', recover: 'off' },
  'not-me': { release: 'off', lock: 'recommended', recover: 'off' },
  secured: { release: 'off', lock: 'done', recover: 'on' },
  'its-me': { release: 'recommended', lock: 'off', recover: 'off' },
  released: { release: 'done', lock: 'off', recover: 'off' },
}

export const isOpen = (s: TakeoverStage) => s !== 'watching'
export const heardNo = (s: TakeoverStage) => s === 'not-me' || s === 'secured'
export const heardYes = (s: TakeoverStage) => s === 'its-me' || s === 'released'
export const wasAsked = (s: TakeoverStage) => s !== 'watching' && s !== 'paused'

/** A YES on the prior contact always releases the light check, and the full stop only if POLICY says so. */
export const yesReleases = (
  fullStop: boolean,
  rule: typeof POLICY.fullStopRelease = POLICY.fullStopRelease,
) => !fullStop || rule === 'yes'

const hint: Record<TakeoverStage, string> = {
  watching: 'Nothing to do yet. Second Look acts on its own if all three signals line up.',
  paused: 'Sound is asking the member on a safe contact. No action needed yet.',
  asked: 'Waiting for the member. Release needs a YES on a safe contact.',
  'not-me': 'The member says it was not them. Keep it stopped and lock the account.',
  secured: 'Locked. The case stays open while the member gets back in.',
  'its-me': 'The member confirmed on a safe contact. Release is one click.',
  released: 'Done. No call, no branch visit.',
}

const callbackHint: Partial<Record<TakeoverStage, string>> = {
  asked: 'Waiting for the member. A YES alone does not release it: a specialist calls back first.',
  'its-me': 'The member said YES. Call the number on file before the change, then release.',
  released: 'Released after a specialist called the number on file before the change.',
}

export const stageHint = (stage: TakeoverStage, yesOk: boolean) =>
  (yesOk ? undefined : callbackHint[stage]) ?? hint[stage]

export function releaseHint(stage: TakeoverStage, yesOk: boolean) {
  if (yesOk) return stage === 'its-me' ? 'YES came from a safe contact' : 'Needs a YES on a safe contact'
  return stage === 'its-me'
    ? 'Call the number on file before the change first'
    : 'Needs a callback to the number on file before the change'
}

/** Sound's answer when the member taps "Yes, it was me" on the prior contact. */
export const yesReply = (yesOk: boolean) =>
  yesOk
    ? "Thanks. We've released the payment for processing."
    : "Thanks. We'll call you at this number to confirm before we send it."

const holdLine = {
  all: 'All outgoing payments held while this case is open.',
  risky:
    'New payees, payee edits and profile changes held while this case is open. Scheduled payments to existing payees continue.',
  riskyLocked:
    'Online access locked; new payees, payee edits and profile changes held. Scheduled payments to existing payees continue.',
}

/** What else stays held while a full-stop case is open. The light check holds only its own payment. */
export function caseHold(
  stage: TakeoverStage,
  fullStop: boolean,
  rule: typeof POLICY.caseHold = POLICY.caseHold,
): string | null {
  if (!fullStop || stage === 'watching' || stage === 'released') return null
  if (rule === 'all') return holdLine.all
  return stage === 'secured' ? holdLine.riskyLocked : holdLine.risky
}
