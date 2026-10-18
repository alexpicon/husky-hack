/** The kit loads whole; the rule files assert each trigger's design check. */
import { describe, expect, it } from 'vitest'
import { events, memberKeys } from './kit'

describe('kit', () => {
  it('loads every event and member', () => {
    expect(events).toHaveLength(7471)
    expect(memberKeys).toHaveLength(118)
  })
})

