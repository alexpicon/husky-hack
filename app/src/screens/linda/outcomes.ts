import { CircleCheck, LifeBuoy, PhoneOff, Send, type LucideIcon } from 'lucide-react'
import { clock } from '../../ui/format'
import type { Tone } from '../../ui/primitives'
import { dollars, HOLD_HOURS, LINDA_NAME, lindaFacts } from './facts'
import type { Outcome, OutcomeKind } from './lindaCase'

/** Shown with every ending: in the kit, Linda was asked for cash "for bail" the next day. */
export const SEQUEL =
  'Scammers often come back for more. If anyone asks you for more money, call us first.'

export const ENDING_ICON: Record<OutcomeKind, LucideIcon> = {
  cancelled: CircleCheck,
  sent: Send,
  help: LifeBuoy,
  'no-response': PhoneOff,
}

export const RELEASE_REASONS = [
  'She still wants to send after we talked',
  'She checked with the person on a number she saved',
] as const

type Copy = {
  tone: Tone
  /** Short status for pills and the member's reply line. */
  status: string
  /** What Linda sees. */
  title: string
  body: string
  /** What the wire desk sees. */
  staff: string
}

/** The words for each ending, on both sides of the counter. */
export function outcomeCopy(outcome: Outcome): Copy {
  const f = lindaFacts()
  const amount = dollars(f.wire.amount)
  const at = clock(new Date(outcome.at))
  const copy: Record<OutcomeKind, Copy> = {
    cancelled: {
      tone: 'safe',
      status: 'Wire cancelled',
      title: 'Your wire is cancelled.',
      body: `Nothing was sent. The ${amount} stays in your account.`,
      staff: `${LINDA_NAME} cancelled the wire at ${at}. The ${amount} stays in her account.`,
    },
    sent: {
      tone: 'brand',
      status: 'Sent after talking with staff',
      title: 'Your wire was sent after you talked with us.',
      body: `${amount} was released for processing at ${at}. If anything about it feels wrong later, tell us right away: a wire recall can be requested, not promised.`,
      staff: `Released at ${at} after staff talked with ${LINDA_NAME}. Reason: ${outcome.reason ?? 'not given'}.`,
    },
    help: {
      tone: 'brand',
      status: 'Help requested',
      title: 'A specialist is checking this with you.',
      body: `Your ${amount} wire stays paused. It isn't sent unless you say so after you talk.`,
      staff: `${LINDA_NAME} asked for help at ${at}. A specialist has the case; the wire desk can't release it.`,
    },
    'no-response': {
      tone: 'neutral',
      status: 'Not sent: no answer',
      title: "Your wire wasn't sent.",
      body: `We didn't hear back from you by ${clock(f.holdEnds)}, so the ${amount} is still in your account. You can send it any time.`,
      staff: `No answer by ${clock(f.holdEnds)}, the end of the ${HOLD_HOURS}-hour hold. The wire was not sent; the money stays in her account.`,
    },
  }
  return copy[outcome.kind]
}
