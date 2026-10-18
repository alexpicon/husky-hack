/** How the panel hears a judge: Skipper's panel list, and the wall result her words lead to. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { JAMES_TAPS } from '../screens/james/copy'
import { TAP_OPTIONS } from '../screens/linda/taps'
import { ROMANCE_OPTIONS } from '../screens/michael/check'
import { hearPanel, oneCopyEach, PANEL_TAPS, type Heard } from './classify'
import { bareId, COMMON_TAPS, GROUP_RESULTS, NO_PATTERN, PANEL_GROUPS, resultFor } from './results'

afterEach(() => {
  vi.unstubAllGlobals()
})

const resultOf = async (text: string) => {
  const heard = await hearPanel(text, 'keywords')
  for (const { quote } of heard.taps) expect(text.toLowerCase()).toContain(quote.toLowerCase())
  return resultFor(heard.taps.map((t) => t.tap))
}

const idsOf = async (text: string) => (await hearPanel(text, 'keywords')).taps.map((t) => t.tap.id)

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

  it('counts every tap more than one scam has as common, so it never breaks a tie', () => {
    const ids = PANEL_TAPS.map((t) => bareId(t.id))
    const shared = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(shared.length).toBeGreaterThan(0)
    for (const id of shared) expect(COMMON_TAPS).toContain(id)
  })
})

describe("a judge's words", () => {
  it('match the wall lines a panel would see', async () => {
    expect(await resultOf("lawyer says don't tell mom")).toBe(GROUP_RESULTS.grandparent)
    expect(await resultOf('my son needs bail')).toBe(GROUP_RESULTS.grandparent)
    expect(await resultOf('IRS warrant, buy gift cards')).toBe(GROUP_RESULTS.government)
    expect(await resultOf('we met online, she says her crypto platform doubles it')).toBe(GROUP_RESULTS.romance)
  })

  it('name the scam the story fits when it has an officer, an arrest or a secret', async () => {
    expect(await resultOf("lawyer says don't tell mom, my grandson needs bail")).toBe(GROUP_RESULTS.grandparent)
    expect(await resultOf("my grandson was arrested, don't tell his mom")).toBe(GROUP_RESULTS.grandparent)
    const detective = 'a detective said my identity is in a federal investigation, keep it secret and bring cash'
    expect(await resultOf(detective)).toBe(GROUP_RESULTS.government)
    const officer = 'A police officer from the FBI says there is a warrant for my arrest, keep it secret'
    expect(await resultOf(officer)).toBe(GROUP_RESULTS.government)
    expect(await resultOf("Detective says my accounts are under investigation, don't tell the bank")).toBe(
      GROUP_RESULTS.government,
    )
    const irs = "The IRS says I'm under investigation"
    expect(await resultOf(`${irs} and not to tell my family`)).toBe(GROUP_RESULTS.government)
    expect(await resultOf(`${irs} and I owe a processing fee`)).not.toBe(GROUP_RESULTS.romance)
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

describe('one suggestion per warning sign', () => {
  it('lights up one secret tap for one "don\'t tell", under the scam the story fits', async () => {
    expect(await idsOf("lawyer says don't tell mom")).toEqual(['grandparent.official', 'grandparent.secret'])
    expect(await idsOf("lawyer says don't tell mom, my grandson needs bail")).toEqual([
      'grandparent.family',
      'grandparent.official',
      'grandparent.secret',
      'grandparent.bail',
    ])
    const detective = 'a detective said my identity is in a federal investigation, keep it secret and bring cash'
    expect(await idsOf(detective)).toEqual(['grandparent.official', 'government.investigation', 'government.secret'])
  })

  it('keeps one copy when nothing else was heard', async () => {
    expect(await idsOf("please don't tell mom")).toEqual(['grandparent.secret'])
    expect(await idsOf('he told me what to say to the bank')).toEqual(['grandparent.coached'])
  })

  it('keeps a copy under each scam when two other stories tie, so the wall still names none', async () => {
    const ids = await idsOf("The IRS says there is an investigation, and my crypto platform says don't tell anyone")
    expect(ids).toEqual(['government.investigation', 'government.secret', 'romance.investment', 'romance.secret'])
  })

  it('never changes the wall result, for any set of taps Skipper could suggest', () => {
    for (let mask = 0; mask < 2 ** PANEL_TAPS.length; mask++) {
      const heard: Heard['taps'] = PANEL_TAPS.filter((_, i) => mask & (2 ** i)).map((tap) => ({ tap, quote: 'q' }))
      const kept = oneCopyEach(heard)
      expect(resultFor(kept.map((h) => h.tap))).toBe(resultFor(heard.map((h) => h.tap)))
    }
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
