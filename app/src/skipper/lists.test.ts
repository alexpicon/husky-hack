/** Skipper's tap lists: each matches its check word for word and never offers an all-clear. */
import { describe, expect, it } from 'vitest'
import { JAMES_TAPS } from '../screens/james/copy'
import { TAP_OPTIONS } from '../screens/linda/taps'
import { ROMANCE_OPTIONS } from '../screens/michael/check'
import { allowedIds, isScreen, SKIPPER_LISTS } from './lists'

const CHECKS = {
  linda: TAP_OPTIONS,
  michael: ROMANCE_OPTIONS,
  james: JAMES_TAPS,
} as const

const ALL_CLEAR = ['none', 'other', 'own']

describe.each(Object.keys(CHECKS) as (keyof typeof CHECKS)[])("the %s list", (screen) => {
  const check: readonly { id: string; label: string; kind: string }[] = CHECKS[screen]

  it("uses the check's own ids and labels", () => {
    for (const tap of SKIPPER_LISTS[screen]) {
      const on = check.find((o) => o.id === tap.id)
      expect(on?.label).toBe(tap.label)
      expect(on?.kind).toBe(tap.kind)
    }
  })

  it('offers every signal on the check and nothing that clears', () => {
    const signals = check.filter((o) => o.kind === 'signal').map((o) => o.id)
    expect(allowedIds(screen)).toEqual(expect.arrayContaining(signals))
    for (const id of ALL_CLEAR) expect(allowedIds(screen)).not.toContain(id)
  })
})

describe('the panel list', () => {
  it('holds the three scams’ signals, each under its group', () => {
    const panel = SKIPPER_LISTS.panel
    expect(panel.filter((t) => t.group === 'grandparent')).toHaveLength(5)
    expect(panel.filter((t) => t.group === 'government')).toHaveLength(5)
    expect(panel.filter((t) => t.group === 'romance')).toHaveLength(4)
    expect(panel.every((t) => t.kind === 'signal' && t.id.startsWith(`${t.group}.`))).toBe(true)
    expect(new Set(panel.map((t) => t.id)).size).toBe(panel.length)
  })
})

describe('every list', () => {
  it.each(Object.keys(SKIPPER_LISTS))('%s has no all-clear and a pattern for each tap', (screen) => {
    expect(isScreen(screen)).toBe(true)
    for (const tap of SKIPPER_LISTS[screen as keyof typeof SKIPPER_LISTS]) {
      expect(ALL_CLEAR).not.toContain(tap.id.split('.').pop())
      expect(tap.words.length).toBeGreaterThan(0)
      expect(tap.about.length).toBeGreaterThan(10)
    }
  })

  it('knows only its screens', () => {
    expect(isScreen('toString')).toBe(false)
    expect(isScreen('m1039')).toBe(false)
    expect(isScreen(7)).toBe(false)
  })
})
