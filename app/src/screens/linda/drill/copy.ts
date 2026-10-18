import { canGuess, result, type Round, type Score, type Side } from './voiceGame'

export const DRILL_TITLE = 'Real or AI?'
export const DRILL_SUBTITLE = 'A 2-minute scam drill'
export const OPT_IN = 'Want to try a 2-minute drill?'

/** Said with every reveal and the score: a right answer is never proof. */
export const CAUTION = "Even when you're right, you can't be sure by ear."

export const LESSONS = ['Make a family safe word', 'Call back on the number YOU saved'] as const

/** What the held wire leads with once she has done the drill. */
export const REMINDER =
  'Remember your drill: call back on the number you saved, or ask for your family safe word.'

export const NOT_ADDED = 'Recording not added yet'

export const letter = (side: Side) => side.toUpperCase()

/** One line for the current state of the round. It reports, and never praises or scores her. */
export function prompt(round: Round | null): string {
  if (!round) return 'No recordings are available right now.'
  const r = result(round)
  if (r) {
    const picked = round.guess ? ` You picked ${letter(round.guess)}.` : ''
    return `Recording ${letter(r.syntheticSide)} is the AI voice.${picked} ${CAUTION}`
  }
  if (!canGuess(round)) {
    return round.missing.length
      ? 'Play the recording that is here, or skip this pair.'
      : 'Play both recordings to unlock your answer. You can replay them as often as you like.'
  }
  if (round.missing.length) return `${NOT_ADDED}. Read the words, then answer or skip this pair.`
  return 'Which recording is AI? Choose one, or listen again.'
}

/** "You got 2 of 3." with the caution, and no verdict on how good she is. */
export function scoreText(score: Score): string {
  if (!score.total) return `No answers this time. ${CAUTION}`
  return `You got ${score.correct} of ${score.total}. ${CAUTION}`
}
