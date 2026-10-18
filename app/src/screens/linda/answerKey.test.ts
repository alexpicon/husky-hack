/** Linda's screens and wire desk read only kit events, never the Member Key answer sheet. */
import { describe, expect, it } from 'vitest'
import { nameScam } from './scams'

const sources = import.meta.glob(
  [
    './*.{ts,tsx}',
    '!./*.test.{ts,tsx}',
    '../staff/Tricked*.tsx',
    '../staff/{CheckPanels,WirePanels}.tsx',
    '../staff/{trickedFacts,silentCheck}.ts',
    '../../story/linda.tsx',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

describe('the answer key stays out of Linda', () => {
  it('finds the files it checks', () => {
    expect(Object.keys(sources)).toEqual(
      expect.arrayContaining(['./facts.ts', '../staff/trickedFacts.ts', '../../story/linda.tsx']),
    )
  })

  it.each(Object.keys(sources))('%s never reads the Member Key', (file) => {
    expect(sources[file]).not.toMatch(/keyFor|memberKeys|MemberKey|\.subtype|Member_Key/)
  })
})

describe('naming a scam from her taps', () => {
  it('needs two or more taps that fit it', () => {
    expect(nameScam(['family', 'secret'])?.scam.name).toBe('grandparent scam')
    expect(nameScam(['family', 'official', 'secret', 'bail'])?.fitting).toHaveLength(4)
    expect(nameScam(['secret'])).toBeNull()
    expect(nameScam([])).toBeNull()
    expect(nameScam(['other'])).toBeNull()
  })
})
