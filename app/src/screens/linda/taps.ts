import { useSyncExternalStore } from 'react'
import { Gavel, House, Lock, Scale, Users, type LucideIcon } from 'lucide-react'

export type TapId = 'family' | 'official' | 'secret' | 'bail' | 'other'

export type TapOption = {
  id: TapId
  label: string
  short: string
  icon: LucideIcon
  scamSignal: boolean
}

export const TAP_OPTIONS: TapOption[] = [
  {
    id: 'family',
    label: 'Someone called about a family member in trouble',
    short: 'Family member in trouble',
    icon: Users,
    scamSignal: true,
  },
  {
    id: 'official',
    label: 'A lawyer or official is involved',
    short: 'Lawyer involved',
    icon: Scale,
    scamSignal: true,
  },
  {
    id: 'secret',
    label: 'I was told to keep this secret',
    short: 'Told to keep it secret',
    icon: Lock,
    scamSignal: true,
  },
  {
    id: 'bail',
    label: "It's for bail or a fine",
    short: 'Bail or a fine',
    icon: Gavel,
    scamSignal: true,
  },
  {
    id: 'other',
    label: 'Something else (e.g. buying a home)',
    short: 'Something else',
    icon: House,
    scamSignal: false,
  },
]

/** What Linda taps in the story when the presenter has not tapped anything yet. */
export const STORY_TAPS: TapId[] = ['family', 'official', 'secret', 'bail']

let selected: TapId[] = []
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function toggleTap(id: TapId) {
  selected = selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]
  listeners.forEach((l) => l())
}

export function useTaps(): TapId[] {
  return useSyncExternalStore(subscribe, () => selected)
}
