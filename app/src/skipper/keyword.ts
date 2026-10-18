import { SKIPPER_LISTS, type SkipperScreen } from './lists.ts'
import { clampText, type Suggestion } from './verify.ts'

/**
 * The baseline Skipper: each tap on the screen's list whose patterns match her text, quoting the
 * exact words that matched. It never sends her words anywhere.
 */
export function matchKeywords(screen: SkipperScreen, text: string): Suggestion[] {
  const said = clampText(text)
  return SKIPPER_LISTS[screen].flatMap((tap) => {
    if (tap.needs && !tap.needs.test(said)) return []
    for (const pattern of tap.words) {
      const hit = pattern.exec(said)
      if (hit && hit[0].trim()) return [{ id: tap.id, quote: hit[0].trim() }]
    }
    return []
  })
}
