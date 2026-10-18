/**
 * The human line that opens each story, in words the kit itself supports: the starter
 * kit's persona text and the member's own event notes. Never an age, never a number.
 */
export const OPENINGS = {
  linda: `"Grandma, it's me. I need bail." Then an 'attorney': "Don't discuss this with anyone."`,
  sarah: `A text that looks like it's from Sound sends her to a fake site. She types in her password, then the code sent to her phone.`,
  m1039: 'Wrong passwords, a reset, a new address. The next day, a first payment to someone new.',
  michael: 'A widower meets someone online. The small payments keep growing.',
  james: `"Your identity is linked to a federal investigation. Move your money now, and don't discuss it."`,
} as const

export type StoryId = keyof typeof OPENINGS
