import type { TapId } from './taps'

/** A scam the silent check can name, and which of Linda's taps fit how it works. */
export type ScamPattern = { name: string; fits: TapId[]; how: string; who: string }

export const GRANDPARENT_SCAM: ScamPattern = {
  name: 'grandparent scam',
  fits: ['family', 'official', 'secret', 'bail'],
  how: "Real lawyers don't ask families to keep bail a secret.",
  who: 'your grandchild',
}

/** One tap is never enough to name a scam. */
export const MIN_FITTING_TAPS = 2

/** The scam her own taps point to, or null. Never reads the kit's answer key. */
export function nameScam(taps: readonly TapId[]) {
  const fitting = taps.filter((t) => GRANDPARENT_SCAM.fits.includes(t))
  return fitting.length >= MIN_FITTING_TAPS ? { scam: GRANDPARENT_SCAM, fitting } : null
}
