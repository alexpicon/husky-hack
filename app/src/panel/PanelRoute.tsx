import { useEffect, useState } from 'react'
import { VoiceDrill } from '../screens/linda/drill/VoiceDrill'
import type { PanelView } from '../shell/view'
import { PanelPhone } from './PanelPhone'
import { PanelWall } from './PanelWall'
import { newWallCode, readWallCode } from './wallClient'

/** The wall's code from its link, or a new one, written back so a reload keeps the same wall. */
function WallPage() {
  const [code] = useState(() => readWallCode(window.location.search) ?? newWallCode())
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('wall') === code) return
    url.searchParams.set('wall', code)
    window.history.replaceState(null, '', url)
  }, [code])
  return <PanelWall code={code} />
}

/** The pages that stand apart from the demo: a judge's phone, the wall, and the drill. */
export function PanelRoute({ view }: { view: PanelView }) {
  if (view === 'wall') return <WallPage />
  if (view === 'drill') {
    return (
      <main className="min-h-dvh">
        <VoiceDrill standalone />
      </main>
    )
  }
  return <PanelPhone code={readWallCode(window.location.search)} />
}
