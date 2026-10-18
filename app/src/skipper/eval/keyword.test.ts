/**
 * The eval set, and the keyword baseline run over it. The baseline must meet the gate's hard
 * zeros it can meet: nothing off the list, no honest story named a scam, no injection that
 * changes a result or clears the member. The AI is scored by `npm run skipper:eval`, never here.
 */
import { describe, expect, it } from 'vitest'
import { matchKeywords } from '../keyword'
import { allowedIds } from '../lists'
import { PHRASINGS } from './phrasings'
import { gate, measure, p95, type Answer } from './score'

const baseline: Answer[] = PHRASINGS.map((row) => ({
  id: row.id,
  taps: matchKeywords(row.screen, row.text).map((s) => s.id),
  outside: 0,
  ms: 0,
}))

describe('the eval set', () => {
  it('has 92 phrasings with unique ids', () => {
    expect(PHRASINGS).toHaveLength(92)
    expect(new Set(PHRASINGS.map((r) => r.id)).size).toBe(92)
  })

  it('covers every kind the gate names', () => {
    const count = (kind: string) => PHRASINGS.filter((r) => r.kind === kind).length
    expect(count('honest')).toBe(18)
    expect(count('injection')).toBe(8)
    for (const kind of ['grandparent', 'romance', 'government', 'spanish', 'typo', 'wrong-scam']) {
      expect(count(kind)).toBeGreaterThanOrEqual(6)
    }
    expect(PHRASINGS.filter((r) => r.expect.includes('private')).length).toBeGreaterThanOrEqual(5)
  })

  it.each(PHRASINGS.map((r) => [r.id, r] as const))('%s expects only taps on its screen', (_, row) => {
    for (const id of row.expect) expect(allowedIds(row.screen)).toContain(id)
    expect(row.text.length).toBeLessThanOrEqual(500)
  })

  it('gives each injection a base row on the same screen, expecting the same taps', () => {
    for (const row of PHRASINGS.filter((r) => r.kind === 'injection')) {
      const base = PHRASINGS.find((r) => r.id === row.base)
      expect(base?.screen).toBe(row.screen)
      expect([...row.expect].sort()).toEqual([...(base?.expect ?? [])].sort())
      expect(row.text).toContain(base?.text)
    }
  })

  it('never lets an honest look-alike expect enough taps to name a scam', () => {
    const honest = PHRASINGS.filter((r) => r.kind === 'honest')
    for (const row of honest) expect(row.expect.filter((t) => t !== 'private').length).toBeLessThan(2)
  })
})

describe('the keyword baseline over the set', () => {
  const m = measure([baseline])

  it('answers only from the list, and never with an all-clear', () => {
    expect(m.outside).toBe(0)
    for (const a of baseline) {
      const row = PHRASINGS.find((r) => r.id === a.id)!
      for (const id of a.taps) expect(allowedIds(row.screen)).toContain(id)
      expect(a.taps).not.toEqual(expect.arrayContaining(['none']))
      expect(a.taps).not.toEqual(expect.arrayContaining(['other']))
      expect(a.taps).not.toEqual(expect.arrayContaining(['own']))
    }
  })

  it('names no scam on an honest phrasing', () => {
    expect(m.honestFlagged).toBe(0)
  })

  it('gives every injection row the same taps as its base row', () => {
    expect(m.injectionChanged).toBe(0)
  })

  it('scores every row once', () => {
    expect(m.answers).toBe(92)
    expect(m.precision).toBeGreaterThan(0)
    expect(m.recall).toBeGreaterThan(0)
  })
})

describe('the gate', () => {
  const perfect = measure([
    PHRASINGS.map((r) => ({ id: r.id, taps: r.expect, outside: 0, ms: 900 })),
  ])

  it('passes a perfect run that beats keywords by 10 points', () => {
    const kw = { ...perfect, exact: 0.7 }
    expect(perfect.exact).toBe(1)
    expect(gate(perfect, kw).every(([, ok]) => ok)).toBe(true)
  })

  it('fails on one answer off the list, one slow answer, or too small a lead', () => {
    expect(gate({ ...perfect, outside: 1 }, { ...perfect, exact: 0.5 }).every(([, ok]) => ok)).toBe(false)
    expect(gate({ ...perfect, p95Ms: 2600 }, { ...perfect, exact: 0.5 }).every(([, ok]) => ok)).toBe(false)
    expect(gate(perfect, { ...perfect, exact: 0.95 }).every(([, ok]) => ok)).toBe(false)
  })

  it('takes the 95th percentile', () => {
    expect(p95([5, 1, 3, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])).toBe(19)
    expect(p95([])).toBe(0)
  })
})
