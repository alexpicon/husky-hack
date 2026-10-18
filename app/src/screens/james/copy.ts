import { Ban, Hourglass, Lock, Shield, UserRoundCheck, UserSearch, type LucideIcon } from 'lucide-react'

export type JamesTapId = 'investigation' | 'move' | 'secret' | 'waiting' | 'none' | 'private'

/** signal: how the scam often works. none: points to no scam. request: asks for a private talk. */
export type JamesTap = {
  id: JamesTapId
  label: string
  icon: LucideIcon
  kind: 'signal' | 'none' | 'request'
  hint?: string
}

export const JAMES_TAPS: JamesTap[] = [
  { id: 'investigation', label: "Someone says I'm under investigation", icon: UserSearch, kind: 'signal' },
  { id: 'move', label: 'I was told to move my money to keep it safe', icon: Shield, kind: 'signal' },
  { id: 'secret', label: 'I was told to keep this secret or stay on the phone', icon: Lock, kind: 'signal' },
  { id: 'waiting', label: 'Someone is waiting for this cash', icon: Hourglass, kind: 'signal' },
  { id: 'none', label: 'None of these', icon: Ban, kind: 'none' },
  {
    id: 'private',
    label: "I'd rather talk privately",
    icon: UserRoundCheck,
    kind: 'request',
    hint: 'Staff will find you a private desk',
  },
]

const kindOf = (id: JamesTapId) => JAMES_TAPS.find((t) => t.id === id)?.kind

/** "None of these" clears the answers and any answer clears it; a private talk goes with either. */
export function toggleJamesTap(taps: readonly JamesTapId[], id: JamesTapId): JamesTapId[] {
  let on: JamesTapId[]
  if (taps.includes(id)) on = taps.filter((t) => t !== id)
  else if (kindOf(id) === 'none') on = [...taps.filter((t) => kindOf(t) === 'request'), id]
  else if (kindOf(id) === 'request') on = [...taps, id]
  else on = [...taps.filter((t) => kindOf(t) !== 'none'), id]
  return JAMES_TAPS.map((t) => t.id).filter((t) => on.includes(t))
}

export const SIGNALS = JAMES_TAPS.filter((t) => t.kind === 'signal')
export const NONE = JAMES_TAPS.find((t) => t.kind === 'none')!
export const PRIVATE = JAMES_TAPS.find((t) => t.kind === 'request')!

/** One tap is never enough to name a scam. */
export const MIN_FITTING_TAPS = 2

export const SCAM_NAMED = 'Some of what you tapped is how the government impersonation scam works.'
export const AGENCIES = 'Real government agencies never ask you to withdraw cash or keep it secret.'
export const PRIVATE_REPLY = "Thank you. We'll find you a private place to talk."
/** Shown to everyone, whatever they tap: a coached member may tap what he was told to. */
export const CALL_AGENCY = 'Before you hand anyone cash, call the agency on a number you look up yourself.'
export const AUTONOMY = "It's your money and your decision."

/**
 * What the check says back to his own taps: a scam is named only from two or more taps that fit
 * it, never when he asked to talk privately, and never an all-clear. It never reads the answer key.
 */
export function checkReply(taps: readonly JamesTapId[]) {
  if (taps.includes('private')) return { said: PRIVATE_REPLY, agencies: null }
  const fitting = taps.filter((t) => kindOf(t) === 'signal')
  if (fitting.length >= MIN_FITTING_TAPS) return { said: SCAM_NAMED, agencies: AGENCIES }
  return { said: null, agencies: null }
}

/** The question the heads-up suggests; the kit's teller asked it word for word. */
export const QUESTION = 'Has anyone told you to keep this secret or to stay on the phone?'
