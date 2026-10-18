import { useEffect, useState } from 'react'
import { skipperMode, suggestTaps, type SkipperMode } from '../skipper/client'
import { SKIPPER_LISTS } from '../skipper/lists'
import { bareId, leadingGroups, type PanelGroup } from './results'

/** One warning tap a judge can confirm, from the story whose scam it belongs to. */
export type PanelTap = { id: string; label: string; group: PanelGroup }

/** Skipper's panel list: every signal tap of Linda's, James's and Michael's checks, by scam. */
export const PANEL_TAPS: PanelTap[] = SKIPPER_LISTS.panel.flatMap((t) =>
  t.group ? [{ id: t.id, label: t.label, group: t.group }] : [],
)

export type Source = SkipperMode
export type Heard = { taps: { tap: PanelTap; quote: string }[]; source: Source }

/**
 * How Skipper hears on this page, asked of the server once. Keywords until it answers, so the
 * privacy line on screen is always the one that applies to what she sends.
 */
export function useSkipperMode(): Source {
  const [mode, setMode] = useState<Source>('keywords')
  useEffect(() => {
    let live = true
    void skipperMode().then((m) => live && setMode(m))
    return () => {
      live = false
    }
  }, [])
  return mode
}

/**
 * One suggestion per warning sign: a tap more than one scam has stays only under the scam her
 * words fit best, or under each scam tied for the lead, so one "don't tell" is one card, never three.
 * The wall's result comes out the same as with every copy.
 */
export function oneCopyEach(heard: Heard['taps']): Heard['taps'] {
  const leaders = leadingGroups(heard.map((h) => h.tap))
  return heard.filter((h) => {
    const copies = heard.filter((x) => bareId(x.tap.id) === bareId(h.tap.id))
    const led = copies.filter((x) => leaders.includes(x.tap.group))
    return led.length ? led.includes(h) : copies[0] === h
  })
}

/** Skipper's suggestions for her words in the mode her privacy line showed. Unknown taps are dropped. */
export async function hearPanel(text: string, mode: Source): Promise<Heard> {
  const { taps, source } = await suggestTaps('panel', text, mode)
  const heard = taps.flatMap(({ id, quote }) => {
    const tap = PANEL_TAPS.find((t) => t.id === id)
    return tap ? [{ tap, quote }] : []
  })
  return { taps: oneCopyEach(heard), source }
}
