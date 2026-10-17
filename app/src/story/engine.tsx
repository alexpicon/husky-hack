import { createContext, useContext, type ReactNode } from 'react'
import type { Tone } from '../ui/primitives'

export type Step = {
  id: string
  /** Presenter headline for this beat. */
  title: string
  /** One plain sentence the presenter can read aloud. */
  caption: string
  /** Story clock shown above the stage, e.g. "Thu, Oct 15 · 10:22 PM". */
  clock: string
  member: ReactNode
  staff: ReactNode
  /** Overrides the label above the member pane. */
  memberLabel?: string
}

export type Scenario = {
  id: string
  label: string
  sublabel: string
  tone: Tone
  steps: Step[]
}

type StoryApi = {
  index: number
  count: number
  next: () => void
  prev: () => void
  goTo: (i: number) => void
}

export const StoryContext = createContext<StoryApi>({
  index: 0,
  count: 0,
  next: () => {},
  prev: () => {},
  goTo: () => {},
})

/** Lets a tap inside a member or staff screen advance the story. */
export const useStory = () => useContext(StoryContext)
