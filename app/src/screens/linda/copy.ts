import { clock } from '../../ui/format'
import { lindaFacts } from './facts'
import { nameScam } from './scams'
import { TAP_OPTIONS, type TapId } from './taps'

export type Reply = 'calling' | 'staff' | null

export const replies: Record<Exclude<Reply, null>, string> = {
  calling: 'Take your time. Your wire stays paused while you call.',
  staff: 'Someone from our team is on the way. You can still send it.',
}

export const AUTONOMY = "It's your money and your decision."

/** When the hold ends, said as the time of the next update: never a countdown. */
export const checkBackBy = () => `We'll check back by ${clock(lindaFacts().holdEnds)}`

export const HOLD_PROMISE =
  "Your wire stays paused while you decide. If we can't reach you by then, it isn't sent and the money stays in your account."

/** What her own taps say. Nothing here reads the kit's answer key or fills in for her. */
export function readTaps(taps: readonly TapId[]) {
  return {
    shown: TAP_OPTIONS.filter((o) => taps.includes(o.id)),
    named: nameScam(taps),
    talkPrivately: taps.includes('private'),
  }
}

type Read = ReturnType<typeof readTaps>

/**
 * What the check says back: never an all-clear, never a scam named from one tap, and no
 * scam words on screen when she asked to talk privately.
 */
export function verdict({ named, talkPrivately }: Read) {
  if (talkPrivately) {
    return {
      headline: "Thank you. We'll find you a private place to talk.",
      subline: "Someone from our team will come to you. You don't have to explain anything here.",
    }
  }
  if (named) {
    return {
      headline: `Some of what you tapped is how the ${named.scam.name} works.`,
      subline: `Let's check before you send. ${named.scam.how}`,
    }
  }
  return {
    headline: "We can't confirm this request from your answers.",
    subline: 'You can still get help checking it.',
  }
}

/** Shown to everyone on hold, whatever they tap: a coached member may tap what she was told to. */
export const callBack = ({ named }: Read) => ({
  lead: `Before you send, call ${named?.scam.who ?? 'the person this money is for'} on the number YOU saved,`,
  rest: 'not a number someone gave you today.',
})
