import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header, type Tab } from './shell/Header'
import { Narrator } from './shell/Narrator'
import { PilotView } from './shell/PilotView'
import { RemoteView } from './shell/RemoteView'
import { SessionControl } from './shell/SessionControl'
import { BothStage, MemberStage, StaffStage } from './shell/Stages'
import { useWindowSync } from './shell/sync'
import { initialView, ViewToggle, writeViewToUrl, type View } from './shell/view'
import { StoryContext, type Scenario } from './story/engine'
import { linda } from './story/linda'
import { m1039 } from './story/m1039'
import { sarah } from './story/sarah'

const scenarios: Scenario[] = [sarah, m1039, linda]
const PILOT: Tab = { id: 'pilot', label: 'Design check', sublabel: 'Kit data + pilot', tone: 'brand' }
const tabs: Tab[] = [...scenarios, PILOT]

type Position = { active: string; steps: Record<string, number> }

/** Deep link: #sarah/3 opens Sarah's third step. */
function fromHash(): Position {
  const [id, n] = window.location.hash.slice(1).split('/')
  const active = tabs.some((t) => t.id === id) ? id : scenarios[0].id
  return { active, steps: n ? { [active]: Number(n) - 1 || 0 } : {} }
}

export default function App() {
  const [position, setPosition] = useState<Position>(fromHash)
  const [view, setView] = useState<View>(initialView)
  const { active, steps } = position
  const scenario = scenarios.find((s) => s.id === active)
  const index = Math.min(steps[active] ?? 0, Math.max(0, (scenario?.steps.length ?? 1) - 1))
  const count = scenario?.steps.length ?? 0

  useWindowSync('position', position, setPosition)

  const setActive = useCallback((id: string) => setPosition((p) => ({ ...p, active: id })), [])
  const goTo = useCallback(
    (i: number) =>
      setPosition((p) => ({
        ...p,
        steps: { ...p.steps, [active]: Math.max(0, Math.min(count - 1, i)) },
      })),
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
  }, [api, setActive])

  useEffect(() => {
    const hash = scenario ? `#${active}/${index + 1}` : `#${active}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
  }, [active, index, scenario])

  const changeView = (v: View) => {
    setView(v)
    writeViewToUrl(v)
  }

  const step = scenario?.steps[index]
  const id = `${active}-${step?.id}`
  const narrator = scenario && (
    <Narrator
      steps={scenario.steps}
      index={index}
      onPrev={api.prev}
      onNext={api.next}
      onGo={goTo}
      extra={
        <div className="flex flex-wrap justify-end gap-2">
          <SessionControl />
          <ViewToggle view={view} onChange={changeView} />
        </div>
      }
    />
  )
  if (view === 'remote') {
    return (
      <StoryContext.Provider value={api}>
        <RemoteView
          tabs={tabs}
          active={active}
          scenario={scenario}
          index={index}
          onSelect={setActive}
          onPrev={api.prev}
          onNext={api.next}
          onGo={goTo}
        />
      </StoryContext.Provider>
    )
  }

  return (
    <StoryContext.Provider value={api}>
      <Header tabs={tabs} active={active} onSelect={setActive} />
      <main
        className={`mx-auto px-6 pt-8 pb-16 lg:px-8 ${view === 'both' ? 'max-w-[1440px]' : 'max-w-[1680px]'}`}
      >
        {!scenario && <PilotView />}
        {scenario && !step && <p className="text-ink-3">This story is being built.</p>}
        {step && view === 'both' && (
          <>
            {narrator}
            <BothStage id={id} step={step} />
          </>
        )}
        {step && view === 'member' && <MemberStage id={id} step={step} narrator={narrator} />}
        {step && view === 'staff' && (
          <>
            {narrator}
            <StaffStage id={id} step={step} />
          </>
        )}
      </main>
    </StoryContext.Provider>
  )
}
