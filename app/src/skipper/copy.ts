import type { SkipperMode } from './client'

/**
 * Everything Skipper says, as fixed wording. The AI only picks taps from a list; it never writes
 * a line the member sees. None of it calls anything safe, verified or free of risk.
 */
export const SKIPPER_TITLE = "Skipper · Sound's assistant"
export const CONCEPT = 'Concept: how Skipper could do this.'

export const HEARD = "Here's what I heard. Is this right?"
export const NO_MATCH = "I couldn't match that. Please tap what fits."
export const NOT_QUITE = 'Okay. Please tap what fits, or tell me again.'
export const THINKING = 'Skipper is reading what you wrote...'
export const APPLIED = "Thanks. I've tapped those for you. You can change any of them."
export const APPLIED_SHEET = "Thanks. I've added those to your answers."
export const YES = "Yes, that's right"
export const NO = 'Not quite'
export const TALK = 'Talk to a person'
export const NOT_NOW = 'Not now'
export const SEND = 'Send to Skipper'

/** Said only when the check's own rule names the scam from two or more fitting taps. */
export const namedLine = (scam: string, how: string) => `Some of what you told me is how a ${scam} works. ${how}`
export const ROMANCE_NAMED = namedLine(
  'relationship investment scam',
  "Being able to withdraw a little doesn't prove it's real. Don't pay a fee to unlock money.",
)
export const PRIVATE_LINE = "Thank you. We'll find you a private place to talk."
export const SARAH_LINE =
  'Thank you. Sound will never call or text to ask for a code. The specialist who calls you will take it from here.'

const PRIVACY: Record<SkipperMode, string> = {
  keywords: 'Skipper matches your words to our list. Your words stay on this device unless you share them.',
  ai: 'Your typed words go to an AI provider to suggest taps.',
}
const SHARED: Record<SkipperMode, string> = {
  keywords: 'If you share, Sound staff see your words.',
  ai: 'If you share, Sound staff see your words and a short summary.',
}

/** The line under the box. `shares` is false where she has no share switch. */
export const privacyLine = (mode: SkipperMode, shares = true) =>
  shares ? `${PRIVACY[mode]} ${SHARED[mode]}` : mode === 'ai' ? PRIVACY.ai : 'Skipper matches your words to our list. Your words stay on this device.'

export const NOTE_TITLE = "Skipper's note · AI draft · staff decides"
export const wordsTitle = (name: string) => `In ${name}'s words · typed to Skipper`
