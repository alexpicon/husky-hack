/** The recordings bundled under public/voice-check/: exactly the reviewed clips, all well formed. */
import { describe, expect, it } from 'vitest'
import type { CatalogClip, CheckPair, CheckPortrait } from './voiceCheck'

const DIR = '../../../../public/voice-check/'
const text = import.meta.glob(['../../../../public/voice-check/data/*.json', '../../../../public/voice-check/CREDITS.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
const read = <T>(path: string): T => JSON.parse(text[DIR + path]) as T
const names = (files: Record<string, unknown>) => Object.keys(files).map((f) => f.split('/').pop()!)
const clipFiles = names(import.meta.glob('../../../../public/voice-check/clips/*'))
const photoFiles = names(import.meta.glob('../../../../public/voice-check/portraits/*'))

const pairs = read<CheckPair[]>('data/pairs.json')
const catalog = read<CatalogClip[]>('data/catalog.json')
const portraits = read<Record<string, CheckPortrait>>('data/portraits.json')

/**
 * Every clip here was transcribed and its words read before it shipped: the drill plays to a
 * bank's panel. A clip added to the data without that review fails this list on purpose.
 */
const REVIEWED = [
  'ITW_10823', 'ITW_13856', 'ITW_15004', 'ITW_1575', 'ITW_17816',
  'ITW_18174', 'ITW_2100', 'ITW_21965', 'ITW_23143', 'ITW_24177',
  'ITW_25055', 'ITW_25241', 'ITW_27271', 'ITW_27646', 'ITW_28871',
  'ITW_3092', 'ITW_31126', 'ITW_31678', 'ITW_5512', 'ITW_9362',
]

describe('the bundled voice set', () => {
  it('holds only reviewed clips', () => {
    expect(catalog.map((c) => c.id).sort()).toEqual([...REVIEWED].sort())
  })

  it('pairs one real and one synthetic clip of the same speaker, with no clip used twice', () => {
    const byId = new Map(catalog.map((c) => [c.id, c]))
    for (const p of pairs) {
      expect(byId.get(p.real)).toMatchObject({ label: 'real', title: p.speaker })
      expect(byId.get(p.fake)).toMatchObject({ label: 'synthetic', title: p.speaker })
    }
    const used = pairs.flatMap((p) => [p.real, p.fake])
    expect(new Set(used).size).toBe(used.length)
    expect(used.sort()).toEqual([...REVIEWED].sort())
  })

  it('ships each listed file and nothing else', () => {
    expect(catalog.map((c) => c.file).sort()).toEqual(catalog.map((c) => `clips/${c.id}.mp3`).sort())
    expect(clipFiles.sort()).toEqual(catalog.map((c) => `${c.id}.mp3`).sort())
    const photos = Object.values(portraits).map((p) => p.file.replace('portraits/', ''))
    expect(photoFiles.sort()).toEqual(photos.sort())
    expect(Object.keys(portraits).sort()).toEqual([...new Set(pairs.map((p) => p.speaker))].sort())
  })

  it('credits every speaker it shows', () => {
    const credits = text[DIR + 'CREDITS.md']
    for (const p of Object.values(portraits)) expect(credits).toContain(`**${p.person}**`)
    expect(credits).toContain(`All ${catalog.length} clips (${pairs.length} genuine/synthetic pairs`)
  })
})
