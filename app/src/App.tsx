import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header, type Tab } from './shell/Header'
import { Narrator } from './shell/Narrator'
import { PilotView } from './shell/PilotView'
import { StoryContext, type Scenario } from './story/engine'
import { linda } from './story/linda'
import { m1039 } from './story/m1039'
import { sarah } from './story/sarah'
import { Eyebrow } from './ui/primitives'

const scenarios: Scenario[] = [sarah, m1039, linda]
const PILOT: Tab = { id: 'pilot', label: 'Design check', sublabel: 'Kit data + pilot', tone: 'brand' }
const tabs: Tab[] = [...scenarios, PILOT]

export default function App() {
  const [active, setActive] = useState(scenarios[0].id)
  const [steps, setSteps] = useState<Record<string, number>>({})
  const scenario = scenarios.find((s) => s.id === active)
  const index = Math.min(steps[active] ?? 0, Math.max(0, (scenario?.steps.length ?? 1) - 1))
  const count = scenario?.steps.length ?? 0

  const goTo = useCallback(
    (i: number) => setSteps((s) => ({ ...s, [active]: Math.max(0, Math.min(count - 1, i)) })),
    [active, count],
  )
  const api = useMemo(
    () => ({ index, count, goTo, next: () => goTo(index + 1), prev: () => goTo(index - 1) }),
    [index, count, goTo],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight') api.next()
      if (e.key === 'ArrowLeft') api.prev()
      const n = Number(e.key)
      if (n >= 1 && n <= tabs.length) setActive(tabs[n - 1].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [api])

  const step = scenario?.steps[index]
  return (
    <StoryContext.Provider value={api}>
      <Header tabs={tabs} active={active} onSelect={setActive} />
      <main className="mx-auto max-w-[1440px] px-6 pt-8 pb-16 lg:px-8">
        {!scenario && <PilotView />}
        {scenario && !step && <p className="text-ink-3">This story is being built.</p>}
        {scenario && step && (
          <>
            <Narrator
              steps={scenario.steps}
              index={index}
              onPrev={api.prev}
              onNext={api.next}
              onGo={goTo}
            />
            <AnimatePresence mode="wait">
              <motion.section
                key={`${scenario.id}-${step.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-8 grid items-start gap-10 xl:grid-cols-[auto_1fr]"
              >
                <div className="flex flex-col items-center gap-3">
                  <Eyebrow>What the member sees</Eyebrow>
                  {step.member}
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <Eyebrow>What Sound staff see</Eyebrow>
                  {step.staff}
                </div>
              </motion.section>
            </AnimatePresence>
          </>
        )}
      </main>
    </StoryContext.Provider>
  )
}
