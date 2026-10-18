/**
 * The code check on Skipper's note for staff. The note only rewords what the member typed: no
 * numbers or amounts, no verdict, no advice. No runtime imports, so the server can use it too.
 */

const MAX_NOTE = 300
const MAX_SENTENCES = 2

const AMOUNT = /\d|\$|\b(?:dollars?|bucks|cents?|usd)\b/i
const VERDICT =
  /\b(?:safe\w*|scam confirmed|fraud confirmed|confirm\w*|releas\w*|approv\w*|verif\w*|no risk|risk[- ]free|legit\w*|genuine|guarantee\w*|should|recommend\w*)\b/i

/** The note when it passes every check, or null, in which case staff see only her words. */
export function checkNote(note: unknown): string | null {
  if (typeof note !== 'string') return null
  const text = note.replace(/\s+/g, ' ').trim()
  if (!text || text.length > MAX_NOTE) return null
  if (AMOUNT.test(text) || VERDICT.test(text) || /[<>{}]/.test(text)) return null
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim())
  return sentences.length <= MAX_SENTENCES ? text : null
}
