/** Which answer to each open decision is in effect. Flipping one in policy.ts means updating this pin. */
import { expect, it } from 'vitest'
import { BRIEF_POLICY } from './briefPolicy'
import { POLICY } from './policy'

it("keeps the brief's answer to every open decision", () => {
  expect(POLICY).toEqual(BRIEF_POLICY)
})
