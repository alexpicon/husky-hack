import { useState } from 'react'
import App from './App'
import { PanelRoute } from './panel/PanelRoute'
import { LindaCaseProvider } from './screens/linda/LindaCaseProvider'
import { RunProvider } from './shell/run'
import { initialView, isPanelView } from './shell/view'
import { SkipperShare } from './skipper/SkipperShare'
import { LookProvider } from './ui/look'

/**
 * A panel page, or the demo with the state its windows share. A panel page joins none of that
 * state, so a key pressed on the wall, a judge's phone or the drill never moves the demo.
 */
export function Root() {
  const [view] = useState(initialView)
  if (isPanelView(view)) return <PanelRoute view={view} />
  return (
    <LookProvider>
      <RunProvider>
        <LindaCaseProvider>
          <App initial={view} />
          <SkipperShare />
        </LindaCaseProvider>
      </RunProvider>
    </LookProvider>
  )
}
