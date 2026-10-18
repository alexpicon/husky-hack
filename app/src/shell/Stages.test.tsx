/** The labeled zones on the stage: whose screen each device is, and what an idle device says. */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sarah as facts } from '../screens/sarah/facts'
import type { Scenario } from '../story/engine'
import { m1039 } from '../story/m1039'
import { sarah } from '../story/sarah'
import { clock } from '../ui/format'
import { BothStage, MemberStage } from './Stages'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look switch syncs across windows, which needs a browser; these tests pick the look.
vi.mock('../ui/look', () => ({ useLook: () => look.current }))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .trim()

/** The zones in stage order, each with the text up to the next zone. */
function zonesOf(html: string) {
  return html
    .split(/(?=<section aria-label="[^"]*" data-zone=")/)
    .slice(1)
    .map((part) => ({ tone: /data-zone="(\w+)"/.exec(part)?.[1], text: textOf(part) }))
}

const zones = sarah.zones!
const idle = {
  noMessage: 'No message yet',
  waiting: 'Still waiting: payment pending review',
  locked: 'Signed out: account locked',
}

describe.each(['concept', 'sound'] as const)("Sarah's three zones (%s look)", (variant) => {
  beforeEach(() => {
    look.current = variant
  })

  it.each(sarah.steps.map((s) => [s.id, s] as const))('step %s labels every device', (_, step) => {
    const html = renderToStaticMarkup(<BothStage id={step.id} step={step} zones={zones} />)
    const found = zonesOf(html)
    expect(found.map((z) => z.tone)).toEqual(['attacker', 'member', 'staff'])
    expect(found[0].text).toMatch(/^Scammer's device Who sees this: Logged in as Sarah: the attacker/)
    expect(found[1].text).toMatch(/^Sarah's real phone Who sees this: The number on file before 10:15 PM/)
    expect(found[2].text).toMatch(/^Sound staff Who sees this: Sound Member Protection/)
  })

  it('shows each idle line only where the story has nothing new for that device', () => {
    const at = (id: string) => {
      const step = sarah.steps.find((s) => s.id === id)!
      return zonesOf(renderToStaticMarkup(<BothStage id={id} step={step} zones={zones} />))
    }
    expect(at('signals')[1].text).toContain(idle.noMessage)
    expect(at('pause')[1].text).toContain(idle.noMessage)
    expect(at('ask')[0].text).toContain(idle.waiting)
    expect(at('not-me')[0].text).toContain(idle.waiting)
    expect(at('secured')[0].text).toContain(idle.locked)
    for (const step of sarah.steps.filter((s) => s.id !== 'secured')) {
      expect(textOf(renderToStaticMarkup(<BothStage id={step.id} step={step} zones={zones} />))).not.toContain(
        idle.locked,
      )
    }
  })

  it('drops the per-device badges and the comparison card the zones replace', () => {
    for (const step of sarah.steps) {
      const text = textOf(renderToStaticMarkup(<BothStage id={step.id} step={step} zones={zones} />))
      for (const gone of ["Signed in as Sarah, but it isn't her", "Still the scammer's screen", 'The real Sarah ', "Sarah's night, two ways"]) {
        expect(text).not.toContain(gone)
      }
    }
  })

  it('puts the two member-side zones, and not staff, on the member laptop', () => {
    const step = sarah.steps[1]
    const html = renderToStaticMarkup(<MemberStage id={step.id} step={step} zones={zones} narrator={null} />)
    expect(zonesOf(html).map((z) => z.tone)).toEqual(['attacker', 'member'])
    expect(html.includes('Pay Anyone')).toBe(variant === 'sound')
  })
})

describe('zone data', () => {
  it("derives Sarah's real phone from the kit's phone change", () => {
    expect(zones.member.who).toBe(`The number on file before ${clock(facts.phoneChange.at)}`)
    expect(clock(facts.phoneChange.at)).toBe('10:15 PM')
  })

  it('keeps two zones for a story without an attacker device', () => {
    const story: Scenario = m1039
    const step = story.steps[0]
    const two = { member: { tone: 'member', label: "M1039's phone", who: 'x' }, staff: zones.staff } as const
    const html = renderToStaticMarkup(<BothStage id={step.id} step={step} zones={two} />)
    expect(zonesOf(html).map((z) => z.tone)).toEqual(['member', 'staff'])
  })
})
