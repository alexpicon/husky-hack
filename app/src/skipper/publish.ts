import { sharedFor, wordsActions, type SharedWords, type SkipperStory } from './shareState'

/** What one window last saw of one member's share switch and round, and what it last sent. */
export type Seen = { shared: boolean; round: number; sent: string }

/** Her share switch, the demo run, her case round, and the words she sent Skipper in this window. */
export type Now = { shared: boolean; run: number; round: number; words: string | null }

/** What the window remembers next, the change to make to the shared copy, and the words it sent. */
export type Step = { seen: Seen; change: ((s: SharedWords) => SharedWords) | null; sent: string | null }

export const firstSeen = (shared: boolean, round: number): Seen => ({ shared, round, sent: '' })

/**
 * One window's look at one member's words, after any change it sees: her words go out when she
 * turns sharing on (or types while it is on), and come back out when she turns it off or her case
 * starts over.
 */
export function publishStep(story: SkipperStory, seen: Seen, now: Now, state: SharedWords): Step {
  const next: Seen = { shared: now.shared, round: now.round, sent: seen.sent }
  // Only a change seen here clears it, so a window that has not yet heard she shares never does.
  if (state[story].words && ((seen.shared && !now.shared) || now.round > seen.round)) {
    return { seen: next, change: (s) => wordsActions.clear(s, story), sent: null }
  }
  const words = now.shared ? now.words : null
  if (!words) return { seen: { ...next, sent: '' }, change: null, sent: null }
  // Sent once per change made here, never in answer to another window's copy: two windows that
  // heard different words would otherwise send theirs in turn forever.
  const key = `${now.run}:${now.round}:${words}`
  if (seen.sent === key) return { seen: next, change: null, sent: null }
  const sent: Seen = { ...next, sent: key }
  if (sharedFor(state, story, now.run, now.round)?.words === words) return { seen: sent, change: null, sent: null }
  return { seen: sent, change: (s) => wordsActions.publish(s, story, now.run, now.round, words), sent: words }
}
