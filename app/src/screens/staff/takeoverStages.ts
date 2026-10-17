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

export const stageHint: Record<TakeoverStage, string> = {
  watching: 'Nothing to do yet. Second Look acts on its own if all three signals line up.',
  paused: 'Sound is asking the member on a safe contact. No action needed yet.',
  asked: 'Waiting for the member. Release needs a YES on a safe contact.',
  'not-me': 'The member says it was not them. Keep it stopped and lock the account.',
  secured: 'Locked. The case stays open while the member gets back in.',
  'its-me': 'The member confirmed on a safe contact. Release is one click.',
  released: 'Done. No call, no branch visit.',
}
