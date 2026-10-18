/** The drill's shared status holds two facts, never her answers, and settles the same in every window. */
import { describe, expect, it } from 'vitest'
import {
  drillActions,
  initialDrill,
  mergeDrills,
  project,
  readDrill,
  staffView,
  updateDrill,
  type DrillState,
} from './drillState'

const done: DrillState = { ...initialDrill, v: 1, completed: true }

describe('what is shared', () => {
  it('is the run, an edit count and two yes-or-no facts', () => {
    expect(Object.keys(initialDrill).sort()).toEqual(['completed', 'run', 'trustedAdded', 'v'])
  })

  it('drops anything else another window sends, such as answers or a score', () => {
    const sent = { ...done, guesses: ['a', 'b'], score: { correct: 2, total: 3 } } as Partial<DrillState>
    expect(project(sent)).toEqual(done)
    expect(project({})).toEqual(initialDrill)
    expect(project({ completed: 'yes' } as unknown as Partial<DrillState>).completed).toBe(false)
  })

  it('shows staff only the two statuses', () => {
    expect(staffView({ ...done, trustedAdded: true })).toEqual({ completed: true, trustedAdded: true })
    expect(Object.keys(staffView(initialDrill)).sort()).toEqual(['completed', 'trustedAdded'])
  })
})

describe('the actions', () => {
  it('completes once, and adding a trusted contact also completes it', () => {
    expect(drillActions.complete(done)).toBe(done)
    expect(drillActions.addTrusted(initialDrill)).toEqual({ ...initialDrill, completed: true, trustedAdded: true })
  })

  it('resets to not done, keeping the run, and leaves a blank status alone', () => {
    const later = { ...done, run: 5, trustedAdded: true }
    expect(drillActions.reset(later)).toEqual({ ...initialDrill, run: 5, v: 1 })
    expect(drillActions.reset(initialDrill)).toBe(initialDrill)
  })

  it('starts over for a new run, and never for an older one', () => {
    const now = { ...done, run: 5 }
    expect(drillActions.forRun(now, 6)).toEqual({ ...initialDrill, run: 6, v: 1 })
    expect(drillActions.forRun(now, 4)).toBe(now)
    expect(drillActions.forRun(now, 5)).toBe(now)
  })

  it('counts an edit when the window changes it', () => {
    const before = readDrill()
    updateDrill(drillActions.complete)
    expect(readDrill()).toEqual({ ...before, completed: true, v: before.v + 1 })
  })
})

describe('merging two windows', () => {
  it('takes the newer run, then the more-edited copy, the same whichever side runs it', () => {
    const older = { ...done, run: 1, v: 9 }
    const newer = { ...initialDrill, run: 2 }
    expect(mergeDrills(older, newer)).toBe(newer)
    expect(mergeDrills(newer, older)).toBe(newer)
    const edited = { ...done, v: 2, trustedAdded: true }
    expect(mergeDrills(done, edited)).toBe(edited)
    expect(mergeDrills(edited, done)).toBe(edited)
    const twin = { ...done, trustedAdded: true }
    expect(mergeDrills(done, twin)).toEqual(mergeDrills(twin, done))
  })
})
