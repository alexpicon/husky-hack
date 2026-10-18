import { useEffect, useState } from 'react'
import { SCRIPTED_PAIRS, type DrillPair } from './clips'
import { loadVoiceCheck } from './voiceCheck'

/** The drill's pairs: `given` as is, or the scripted and bundled pairs once they load. */
export function useDrillPairs(given?: DrillPair[]): DrillPair[] | 'loading' | 'failed' {
  const [loaded, setLoaded] = useState<DrillPair[] | 'loading' | 'failed'>('loading')
  useEffect(() => {
    if (given) return
    let live = true
    loadVoiceCheck().then(
      (pairs) => live && setLoaded([...SCRIPTED_PAIRS, ...pairs]),
      () => live && setLoaded(SCRIPTED_PAIRS.length ? SCRIPTED_PAIRS : 'failed'),
    )
    return () => {
      live = false
    }
  }, [given])
  return given ?? loaded
}
