/**
 * One pair for the drill: the same words, once in a real person's voice and once in an AI voice.
 * The drill plays whatever this list holds, so changing the recordings is a data change.
 */
export type DrillPair = {
  id: string
  /** Who the caller says they are, shown above the two recordings. */
  label: string
  /** The words both recordings say, shown under each play button, so the drill works muted. */
  transcript?: string
  /** URL of the real person's recording. */
  real: string
  /** URL of the AI recording. */
  fake: string
  /** URL of a small photo of the speaker, when the pair has one. */
  portrait?: string
  /** Where the recordings come from, shown once the answer is revealed. */
  credit?: string
}

export const DRILL_ROUNDS = 3

/** Bundled with the app under public/drill/, so the drill works offline. */
const clip = (file: string) => `${import.meta.env.BASE_URL}drill/${file}`

const MADE =
  "Real: a teammate reading the line in their own voice, with their consent. AI: an ElevenLabs Voice Design voice, made from a description, not a copy of anyone's voice."

/** Three scam calls, each read by a person and by an AI voice. No celebrity voices, no clones. */
export const SCAM_SCRIPTS: DrillPair[] = [
  {
    id: 'grandson',
    label: 'A grandson in trouble',
    transcript: "Grandma, it's me. I'm in trouble. Please don't tell Mom.",
    real: clip('grandson-real.mp3'),
    fake: clip('grandson-ai.mp3'),
    credit: MADE,
  },
  {
    id: 'bank',
    label: 'The "bank fraud department"',
    transcript:
      "This is your bank's fraud department. Someone is trying to take your savings. We need you to move them today.",
    real: clip('bank-real.mp3'),
    fake: clip('bank-ai.mp3'),
    credit: MADE,
  },
  {
    id: 'irs',
    label: 'An "IRS agent"',
    transcript: "This is Agent Miller with the IRS. There's a warrant in your name. Pay today and it goes away.",
    real: clip('irs-real.mp3'),
    fake: clip('irs-ai.mp3'),
    credit: MADE,
  },
]

export const DRILL_PAIRS: DrillPair[] = SCAM_SCRIPTS
