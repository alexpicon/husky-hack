/** How the panel hears a judge: Skipper's panel list, and the wall result her words lead to. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { JAMES_TAPS } from '../screens/james/copy'
import { TAP_OPTIONS } from '../screens/linda/taps'
import { ROMANCE_OPTIONS } from '../screens/michael/check'
import { hearPanel, PANEL_TAPS } from './classify'
import { GROUP_RESULTS, NO_PATTERN, PANEL_GROUPS, resultFor } from './results'

afterEach(() => {
  vi.unstubAllGlobals()
})

const resultOf = async (text: string) => {
  const heard = await hearPanel(text, 'keywords')
  for (const { quote } of heard.taps) expect(text.toLowerCase()).toContain(quote.toLowerCase())
  return resultFor(heard.taps.map((t) => t.tap.group))
}

describe('the panel list', () => {
  it('holds every signal tap of the three checks, with their own labels, by scam', () => {
    const signals = (list: { label: string; kind: string }[]) => list.filter((t) => t.kind === 'signal').map((t) => t.label)
    const labels = (group: string) => PANEL_TAPS.filter((t) => t.group === group).map((t) => t.label)
    expect(labels('grandparent')).toEqual(signals(TAP_OPTIONS))
    expect(labels('government')).toEqual(signals(JAMES_TAPS))
    expect(labels('romance')).toEqual(signals(ROMANCE_OPTIONS))
    expect(new Set(PANEL_TAPS.map((t) => t.group))).toEqual(new Set(PANEL_GROUPS))
  })

  it('never offers an answer that clears', () => {
    for (const t of PANEL_TAPS) expect(t.label).not.toMatch(/none of these|something else|my own account|privately/i)
    expect(new Set(PANEL_TAPS.map((t) => t.id)).size).toBe(PANEL_TAPS.length)
  })
})

describe("a judge's words", () => {
  it('match the wall lines a panel would see', async () => {
    expect(await resultOf("lawyer says don't tell mom")).toBe(GROUP_RESULTS.grandparent)
    expect(await resultOf('my son needs bail')).toBe(GROUP_RESULTS.grandparent)
    expect(await resultOf('IRS warrant, buy gift cards')).toBe(GROUP_RESULTS.government)
    expect(await resultOf('we met online, she says her crypto platform doubles it')).toBe(GROUP_RESULTS.romance)
  })

  it('name nothing when they fit no pattern', async () => {
    expect(await resultOf("I'm buying a house and closing on Friday")).toBe(NO_PATTERN)
    expect(await resultOf('')).toBe(NO_PATTERN)
  })

  it('stay on this phone while the page says Skipper matches words to the list', async () => {
    const fetch = vi.fn(async () => new Response('{}'))
    vi.stubGlobal('fetch', fetch)
    expect((await hearPanel('my son needs bail', 'keywords')).source).toBe('keywords')
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('what Skipper may suggest', () => {
  it('drops a tap that is not on the panel list', async () => {
    vi.resetModules()
    vi.doMock('../skipper/client', () => ({
      skipperMode: async () => 'ai',
      suggestTaps: async () => ({
        taps: [
          { id: 'grandparent.none', quote: 'none' },
          { id: 'grandparent.bail', quote: 'bail' },
        ],
        source: 'ai',
      }),
    }))
    const fresh = await import('./classify')
    const heard = await fresh.hearPanel('none, bail', 'ai')
    expect(heard).toMatchObject({ source: 'ai', taps: [{ tap: { id: 'grandparent.bail' }, quote: 'bail' }] })
    expect(heard.taps).toHaveLength(1)
    vi.doUnmock('../skipper/client')
  })
})
