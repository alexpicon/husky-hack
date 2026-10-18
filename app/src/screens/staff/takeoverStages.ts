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

/** The case's status pill. A YES that cannot release the payment on its own still waits on a callback. */
export const pillFor = (stage: TakeoverStage, yesOk: boolean) =>
  stage === 'its-me' && !yesOk ? { label: 'Callback required', tone: 'warn' as Tone, live: true } : stagePill[stage]

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

/** Under a callback, a YES leaves Release off until the specialist reaches the member, and lock stays open. */
export const actionsFor = (stage: TakeoverStage, yesOk: boolean): Record<TakeoverAction, ActionLook> =>
  stage === 'its-me' && !yesOk ? { release: 'off', lock: 'on', recover: 'off' } : actionPlan[stage]

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
  paused: 'Sound is asking the member on an unchanged contact. No action needed yet.',
  asked: 'Waiting for the member. Release needs a YES on an unchanged contact.',
  'not-me': 'The member says it was not them. Keep it stopped and lock the account.',
  secured: 'Locked. The case stays open while the member gets back in.',
  'its-me': 'The member confirmed on an unchanged contact. Release is one click.',
  released: 'Done. No call, no branch visit.',
}

const callbackHint: Partial<Record<TakeoverStage, string>> = {
  asked: 'Waiting for the member. A YES alone does not release it: a specialist calls back first.',
  'its-me': 'The member said YES. Call the number on file before the change, then release.',
  released: 'Released after a specialist called the number on file before the change.',
}

export const stageHint = (stage: TakeoverStage, yesOk: boolean) =>
  (yesOk ? undefined : callbackHint[stage]) ?? hint[stage]

/** `saidYesFirst`: the member texted YES, so a NO at this stage came from the specialist's callback. */
export function releaseHint(stage: TakeoverStage, yesOk: boolean, saidYesFirst = false) {
  if (saidYesFirst && heardNo(stage)) return 'Callback done: the member said NO'
  if (yesOk) {
    return stage === 'its-me' ? 'YES came from an unchanged contact' : 'Needs a YES on an unchanged contact'
  }
  return stage === 'its-me'
    ? 'Call the number on file before the change first'
    : 'Needs a callback to the number on file before the change'
}

/** Sound's answer when the member taps "Yes, it was me" on the prior contact. */
export const yesReply = (yesOk: boolean) =>
  yesOk
    ? "Thanks. We've released the payment for processing."
    : 'Thanks. A specialist will call you at this number before anything is sent. If someone told you to tap Yes, call the number on your card.'

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
