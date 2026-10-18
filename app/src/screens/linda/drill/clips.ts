/**
 * One pair for the drill: one voice twice, once real and once AI. The drill plays whatever pairs
 * it is given, so changing or adding recordings is a data change.
 */
export type DrillPair = {
  id: string
  /** Who is speaking, or who the caller says they are, shown above the two recordings. */
  label: string
  /** A line under the label, such as where the recordings come from. */
  about?: string
  /** The words a recording says, shown under its play button, so the drill works muted. */
  transcript?: string
  /** URL of the real recording. */
  real: string
  /** URL of the AI recording. */
  fake: string
  /** URL of a small photo of the speaker, when the pair has one. */
  portrait?: string
  /** Where the AI recording comes from, shown once the answer is revealed. */
  credit?: string
}

export const DRILL_ROUNDS = 3

/**
 * Pairs the team records itself, played alongside the bundled public-figure set: the same scam
 * line read by a teammate in their own voice and by an AI voice made from a description, with the
 * line as the transcript and the files bundled under public/drill/ so the drill works offline.
 * Empty until those recordings exist.
 */
export const SCRIPTED_PAIRS: DrillPair[] = []
