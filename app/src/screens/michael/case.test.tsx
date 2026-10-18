/** Michael's step 3: one case from the card to his report, every wire to the account held for a call. */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { michael } from '../../story/michael'
import { caseTimeline, heldWires } from '../staff/michaelCase'
import { initialCheck, type MichaelCheck } from './check'
import { writeCheck } from './checkState'
import { honestLine, michaelFacts } from './facts'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

const reportStep = michael.steps[2]
const text = (node: React.ReactNode) => textOf(renderToStaticMarkup(<>{node}</>))
const f = michaelFacts()
const rows = (c: Partial<MichaelCheck> = {}) => caseTimeline(f, f.reported.at, { ...initialCheck, ...c })

describe('the case timeline', () => {
  it('runs from the card to his report, with all three wires to the account held', () => {
    expect(heldWires(f, f.reported.at).map((e) => e.amount)).toEqual([1500, 2400, 3840])
    expect(rows().map((r) => [r.time, r.label])).toEqual([
      ['Sep 21', 'Pattern card shown · $306.77 P2P'],
      ['Sep 26', '1st wire · held for a call · $1,500.00'],
      ['Sep 30', '2nd wire, same account · held for a call · $2,400.00'],
      ['Oct 4', '3rd wire, same account · held for a call · $3,840.00'],
      ['Oct 10', 'In the kit: the platform blocks withdrawals, and he reports'],
    ])
  })

  it('holds the later wires up to 4 hours, never past 8 PM, and leaves the decision to him', () => {
    expect(rows()[2].detail).toBe('Held until 6:03 PM for a call. He decides.')
    expect(rows()[3].detail).toBe('Held until 8:00 PM for a call. He decides.')
  })

  it('carries his step-2 choice: cancelled, or sent after the call as in the kit', () => {
    expect(rows({ wire: 'cancel' })[1]).toMatchObject({ detail: 'He cancelled it, so it was not sent.', tone: 'safe' })
    for (const wire of ['wait', null] as const) {
      expect(rows({ wire })[1].detail).toBe('Held until 8:00 PM for a call. After the call he sent it, as in the kit. His decision.')
    }
  })

  it('shows nothing from after the story clock', () => {
    const early = caseTimeline(f, new Date(2026, 9, 1), initialCheck)
    expect(early.map((r) => r.time)).toEqual(['Sep 21', 'Sep 26', 'Sep 30'])
  })
})

describe.each(['concept', 'sound'] as const)('step 3 (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
    writeCheck({ ...initialCheck, v: 1 })
  })

  it('says the honest line and the wire framing, and never calls money saved', () => {
    const staff = text(reportStep.staff)
    expect(honestLine()).toBe('First $441 gone before the card. He decides at every step.')
    expect(staff).toContain(honestLine())
    expect(staff).toContain('$7,740 of his $8,487.77 moved after the turn')
    expect(staff).toContain('3 wires held for a call')
    expect(staff).toContain('Open since Sep 21')
    expect(reportStep.caption).toContain(honestLine())
    expect(reportStep.title).toBe('The case stays open: every wire gets a call')
    for (const page of [staff, text(reportStep.member), reportStep.caption]) {
      expect(page.replace(/(not|none of it is) money saved/g, '')).not.toMatch(/\bsaved?\b/i)
      expect(page).not.toMatch(/pig|butcher|usual/i)
    }
  })

  it('keeps the kit card on his side', () => {
    expect(text(reportStep.member)).toContain('In the kit, without Second Look $8,487.77')
  })
})
