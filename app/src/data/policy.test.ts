/** Which answer to each open decision is in effect. Flipping one in policy.ts means updating this pin. */
import { expect, it } from 'vitest'
import { BRIEF_POLICY } from './briefPolicy'
import { POLICY } from './policy'

it("keeps the answers chosen on Sunday: fullStopRelease", () => {
  expect(POLICY).toEqual({ ...BRIEF_POLICY, fullStopRelease: 'callback' })
})
