import { STORY_TAPS, TAP_OPTIONS, type TapId } from './taps'

export type Reply = 'calling' | 'staff' | null

export const replies: Record<Exclude<Reply, null>, string> = {
  calling: 'Take your time. Your wire stays paused while you call.',
  staff: 'Someone from our team is on the way. You can still send it.',
}

export const AUTONOMY = "It's your money and your decision."

/** The taps to show back to Linda: hers, or the story's when the presenter tapped nothing. */
export function shownTaps(tapped: TapId[]) {
  const shown = TAP_OPTIONS.filter((o) => (tapped.length ? tapped : STORY_TAPS).includes(o.id))
  return { shown, matches: shown.some((o) => o.scamSignal) }
}

export const matchHeadline = (matches: boolean, scamName: string) =>
  matches
    ? `What you tapped matches how the “${scamName}” works.`
    : 'Nothing you tapped matches a scam we know.'

export const matchSubline = (matches: boolean) =>
  matches
    ? "Real lawyers don't ask families to keep bail a secret."
    : 'One quick check before it goes, just in case.'
