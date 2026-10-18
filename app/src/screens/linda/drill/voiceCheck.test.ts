/** The bundled public-figure set becomes drill pairs: only well-labeled pairs, each AI clip credited as synthetic. */
import { describe, expect, it, vi } from 'vitest'
import { loadVoiceCheck, PUBLIC_FIGURE, toDrillPairs, type CatalogClip, type CheckPair } from './voiceCheck'

const clip = (id: string, title: string, label: CatalogClip['label']): CatalogClip => ({
  id,
  title,
  label,
  file: `clips/${id}.mp3`,
})

const CLIPS = [
  clip('R1', 'FDR', 'real'),
  clip('F1', 'FDR', 'synthetic'),
  clip('R2', 'Mitch Hedberg', 'real'),
  clip('F2', 'Mitch Hedberg', 'synthetic'),
]
const PORTRAITS = {
  FDR: { file: 'portraits/fdr.jpg', person: 'Franklin D. Roosevelt', artist: 'Leon Perskie', license: 'CC BY 2.0' },
}
const PAIRS: CheckPair[] = [
  { speaker: 'FDR', real: 'R1', fake: 'F1' },
  { speaker: 'Mitch Hedberg', real: 'R2', fake: 'F2' },
  { speaker: 'FDR', real: 'F1', fake: 'R1' },
  { speaker: 'FDR', real: 'R1', fake: 'missing' },
]

describe('the bundled pairs', () => {
  const pairs = toDrillPairs(PAIRS, CLIPS, PORTRAITS, '/voice-check/')

  it('keeps only pairs of one real and one synthetic clip that exist', () => {
    expect(pairs.map((p) => p.id)).toEqual(['R1+F1', 'R2+F2'])
  })

  it('serves every file from under the folder, and a photo only where there is one', () => {
    expect(pairs[0]).toMatchObject({
      label: 'FDR',
      real: '/voice-check/clips/R1.mp3',
      fake: '/voice-check/clips/F1.mp3',
      portrait: '/voice-check/portraits/fdr.jpg',
    })
    expect(pairs[1].portrait).toBeUndefined()
  })

  it('says where they come from, has no transcript, and credits the AI clip as synthetic', () => {
    for (const p of pairs) {
      expect(p.about).toBe(PUBLIC_FIGURE)
      expect(p.transcript).toBeUndefined()
      expect(p.credit).toMatch(/^Synthetic clip from the In-the-Wild research dataset\./)
      expect(p.credit).toContain(`It imitates ${p.label}; it is not a real recording of them.`)
    }
  })
})

describe('loading', () => {
  const json = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body)))

  it('reads the three data files and tries again after a failure', async () => {
    const failing = vi.fn(() => Promise.resolve(new Response('', { status: 404 })))
    await expect(loadVoiceCheck(failing as unknown as typeof fetch)).rejects.toThrow('Could not load')
    const files: Record<string, unknown> = { 'pairs.json': PAIRS, 'catalog.json': CLIPS, 'portraits.json': PORTRAITS }
    const working = vi.fn((url: string) => json(files[url.split('/').pop()!]))
    const pairs = await loadVoiceCheck(working as unknown as typeof fetch)
    expect(pairs.map((p) => p.id)).toEqual(['R1+F1', 'R2+F2'])
    expect(working.mock.calls.map(([url]) => url.split('voice-check/')[1])).toEqual([
      'data/pairs.json',
      'data/catalog.json',
      'data/portraits.json',
    ])
  })
})
