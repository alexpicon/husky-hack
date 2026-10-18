import { lazy, Suspense, type ComponentType } from 'react'

type Drill = ComponentType<{ standalone?: boolean }>

// Found once the drill's screen is in the build; until then the page says it is on its way.
const found = Object.values(import.meta.glob<{ VoiceDrill: Drill }>('../screens/linda/drill/VoiceDrill.tsx'))[0]
const VoiceDrill = found ? lazy(() => found().then((m) => ({ default: m.VoiceDrill }))) : null

const Loading = () => <p className="py-10 text-center text-lg text-ink-2">The drill is loading.</p>

/** "Real or AI?" on its own page, for a judge's phone after the panel. */
export function DrillPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pt-5 pb-10">
      {VoiceDrill ? (
        <Suspense fallback={<Loading />}>
          <VoiceDrill standalone />
        </Suspense>
      ) : (
        <Loading />
      )}
    </main>
  )
}
