import { matchKeywords } from '../skipper/keyword'
import { SKIPPER_LISTS, type SkipperScreen } from '../skipper/lists'
import type { PanelGroup } from './results'

/** One warning tap a judge can confirm, from the story whose scam it belongs to. */
export type PanelTap = { id: string; label: string; group: PanelGroup }

/** Skipper's panel list: every signal tap of Linda's, James's and Michael's checks, by scam. */
export const PANEL_TAPS: PanelTap[] = SKIPPER_LISTS.panel.flatMap((t) =>
  t.group ? [{ id: t.id, label: t.label, group: t.group }] : [],
)

export type Source = 'ai' | 'keywords'
export type Heard = { taps: { tap: PanelTap; quote: string }[]; source: Source }
type Suggest = (
  screen: SkipperScreen,
  text: string,
) => Promise<{ taps: { id: string; quote: string }[]; source: Source }>

/** Skipper's keyword baseline, which never sends her words anywhere. */
const suggest: Suggest = async (screen, text) => ({ taps: matchKeywords(screen, text), source: 'keywords' })

/** How Skipper hears this page, so the privacy line is true before she types. */
export const SKIPPER_MODE: Source = 'keywords'

/** Skipper's suggestions for her words, each with her quoted words. Unknown taps are dropped. */
export async function hearPanel(text: string): Promise<Heard> {
  const { taps, source } = await suggest('panel', text)
  const heard = taps.flatMap(({ id, quote }) => {
    const tap = PANEL_TAPS.find((t) => t.id === id)
    return tap ? [{ tap, quote }] : []
  })
  return { taps: heard, source }
}
