import { nameScam } from './scams'
import { STORY_TAPS, TAP_OPTIONS, type TapId } from './taps'

export type Reply = 'calling' | 'staff' | null

export const replies: Record<Exclude<Reply, null>, string> = {
  calling: 'Take your time. Your wire stays paused while you call.',
  staff: 'Someone from our team is on the way. You can still send it.',
}

export const AUTONOMY = "It's your money and your decision."

type Named = ReturnType<typeof nameScam>

/** The taps to show back to Linda: hers, or the story's when the presenter tapped nothing. */
export function shownTaps(tapped: TapId[]) {
  const ids = tapped.length ? tapped : STORY_TAPS
  return { shown: TAP_OPTIONS.filter((o) => ids.includes(o.id)), named: nameScam(ids) }
}

/** What the check says back. Never an all-clear, and never a scam name from one tap. */
export const verdict = (named: Named) =>
  named
    ? {
        headline: `Some of what you tapped is how the ${named.scam.name} works.`,
        subline: `Let's check before you send. ${named.scam.how}`,
      }
    : {
        headline: "We can't confirm this request from your answers.",
        subline: 'You can still get help checking it.',
      }

/** Shown to everyone on hold, whatever they tap: a coached member may tap what she was told to. */
export const callBack = (named: Named) => ({
  lead: `Before you send, call ${named?.scam.who ?? 'the person this money is for'} on the number YOU saved,`,
  rest: 'not a number someone gave you today.',
})
