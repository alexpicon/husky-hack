import type { DrillPair } from './clips'

/**
 * The recordings bundled under public/voice-check/: pairs of real and synthetic clips of public
 * figures from the In-the-Wild research dataset, with photos and their credits.
 */
export const VOICE_CHECK = `${import.meta.env.BASE_URL}voice-check/`

export const CREDITS_URL = `${VOICE_CHECK}CREDITS.md`

export const PUBLIC_FIGURE = 'Public figure, from a research dataset'

export type CatalogClip = { id: string; title: string; label: 'real' | 'synthetic'; file: string }
export type CheckPair = { speaker: string; real: string; fake: string }
export type CheckPortrait = { file: string; person: string; artist: string; license: string }

const synthetic = (speaker: string) =>
  `Synthetic clip from the In-the-Wild research dataset. It imitates ${speaker}; it is not a real recording of them.`

/** Pairs whose two clips exist and are labeled one real, one synthetic, with paths under `root`. */
export function toDrillPairs(
  pairs: readonly CheckPair[],
  clips: readonly CatalogClip[],
  portraits: Record<string, CheckPortrait>,
  root: string,
): DrillPair[] {
  const catalog = new Map(clips.map((c) => [c.id, c]))
  return pairs.flatMap((p) => {
    const real = catalog.get(p.real)
    const fake = catalog.get(p.fake)
    if (real?.label !== 'real' || fake?.label !== 'synthetic') return []
    const photo = portraits[p.speaker]
    return [
      {
        id: `${real.id}+${fake.id}`,
        label: p.speaker,
        about: PUBLIC_FIGURE,
        real: root + real.file,
        fake: root + fake.file,
        ...(photo ? { portrait: root + photo.file } : {}),
        credit: synthetic(p.speaker),
      },
    ]
  })
}

/** Loads the three data files once per page; a failed load is tried again on the next call. */
let loading: Promise<DrillPair[]> | null = null

export function loadVoiceCheck(fetcher: typeof fetch = fetch): Promise<DrillPair[]> {
  const get = async <T>(path: string): Promise<T> => {
    const response = await fetcher(VOICE_CHECK + path)
    if (!response.ok) throw new Error(`Could not load ${path}`)
    return response.json() as Promise<T>
  }
  loading ??= Promise.all([
    get<CheckPair[]>('data/pairs.json'),
    get<CatalogClip[]>('data/catalog.json'),
    get<Record<string, CheckPortrait>>('data/portraits.json').catch((): Record<string, CheckPortrait> => ({})),
  ]).then(
    ([pairs, clips, portraits]) => toDrillPairs(pairs, clips, portraits, VOICE_CHECK),
    (error: unknown) => {
      loading = null
      throw error
    },
  )
  return loading
}
