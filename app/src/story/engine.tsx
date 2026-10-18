import { createContext, useContext, type ReactNode } from 'react'
import type { Tone } from '../ui/primitives'

export type Step = {
  id: string
  /** Presenter headline for this beat. */
  title: string
  /** One plain sentence the presenter can read aloud. */
  caption: string
  /** A short human line that opens the story, in words the kit supports. */
  opening?: string
  /** Story clock shown above the stage, e.g. "Thu, Oct 15 · 10:22 PM". */
  clock: string
  member: ReactNode
  staff: ReactNode
  /** Overrides the label above the member pane. */
  memberLabel?: string
  /** A third device: what the attacker, signed in as the member, sees on their own screen. */
  attacker?: ReactNode
}

export type ZoneTone = 'attacker' | 'member' | 'staff'

/** A labeled area of the stage that says whose screen it is. */
export type Zone = {
  label: string
  /** Completes "Who sees this: ...". Left out when a step relabels the pane. */
  who?: string
  tone: ZoneTone
}

export type Zones = { attacker?: Zone; member: Zone; staff: Zone }

export type Scenario = {
  id: string
  label: string
  sublabel: string
  tone: Tone
  steps: Step[]
  zones?: Zones
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

/** The zone a screen is drawn in, so a screen can tell whose device it is on. */
export const ZoneToneContext = createContext<ZoneTone | null>(null)

export const useZoneTone = () => useContext(ZoneToneContext)
