import type { Source } from './classify'
import { QUOTE_MAX, type PanelEntry } from './results'
import type { Posted } from './wallClient'

/** Skipper's lines on the panel pages: fixed wording, never written by the AI. */
export const CONCEPT = 'Concept: how Skipper could do this.'
export const PHONE_TITLE = "Scan it. You're Linda."
export const PHONE_ASK = "Tell Skipper what the 'grandson' said."
export const TYPE_HINT = "Type it in your own words. You don't have to say it out loud."
export const READING = 'Skipper is reading your words…'
export const HEARD = "Here's what I heard. Is this right?"
export const NO_MATCH = "I couldn't match that. Please tap what fits."
export const NOT_QUITE = 'Tap what fits. What Skipper heard is marked, not chosen.'
export const HOW = 'Skipper only suggests taps. You confirm them, the 2-tap rule names the result, and a person releases the money.'

const REACHES_WALL = `Only the result and the first ${QUOTE_MAX} characters of what you typed reach the wall.`

/** Says where her words go, for the way Skipper hears on this page. */
export const PRIVACY: Record<Source, string> = {
  keywords: `Skipper matches your words to our list of warning signs, on this phone. ${REACHES_WALL}`,
  ai: `Your typed words go to an AI provider to suggest taps. ${REACHES_WALL}`,
}

export const SOURCE_LINE: Record<Source, string> = {
  ai: 'Suggested by AI from your words. Each one quotes what you typed.',
  keywords: 'Matched your words to our list.',
}

export const PRIVATE_PAGE = 'This page is yours alone. Only your result reaches the wall.'

export const judgeName = (entry: PanelEntry) => entry.judge ?? `Judge ${entry.n}`

/** Where her result stands, in one line. */
export function postLine(post: 'sending' | Posted): string {
  if (post === 'sending') return 'Sending your result to the wall…'
  if (post.ok) return `On the wall as ${judgeName(post.entry)}.`
  if (post.reason === 'full') return 'The wall is full for this round.'
  if (post.reason === 'busy') return 'The wall is busy. Try again in a moment.'
  return "Couldn't reach the wall."
}
