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
