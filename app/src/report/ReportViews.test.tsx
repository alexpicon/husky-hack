/** What the member sees after one tap, what staff see on the case, and where the link appears. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BRIEF_POLICY } from '../data/briefPolicy'
import { POLICY } from '../data/policy'
import { BothStage } from '../shell/Stages'
import { linda } from '../story/linda'
import { m1039 } from '../story/m1039'
import { sarah } from '../story/sarah'
import { initialReport, ReportContext, reportActions, type ReportPlace, type ReportState } from './report'
import { ReportBanner } from './ReportBanner'
import { ReportSheet } from './ReportSheet'

const look = vi.hoisted(() => ({ current: 'sound' as 'concept' | 'sound' }))

// The look switch and the case stores sync across windows, which needs a browser.
vi.mock('../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../shell/sync', () => ({ useWindowSync: () => {} }))

const defaults = { ...POLICY }
beforeEach(() => {
  look.current = 'sound'
  Object.assign(POLICY, BRIEF_POLICY)
})
afterEach(() => Object.assign(POLICY, defaults))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .replace(/ ([.,:])/g, '$1')

const atM1039: ReportPlace = { member: 'M1039', story: 'm1039', clock: 'Tue, Oct 6 · 12:55 PM' }
const filed = reportActions.file(initialReport, atM1039)

function markup(node: ReactNode, state: ReportState = filed) {
  const api = { state, place: atM1039, file: () => {}, requestRecall: () => {} }
  return renderToStaticMarkup(<ReportContext.Provider value={api}>{node}</ReportContext.Provider>)
}
const render = (node: ReactNode, state?: ReportState) => textOf(markup(node, state))

const LINK = "I think I've been scammed"

describe('the report sheet', () => {
  it('says what was paused, the case, and when a specialist calls the number on file', () => {
    expect(render(<ReportSheet onClose={() => {}} />)).toContain(
      "We've paused outgoing payments and opened case CASE-M1039-R1255. A specialist will call you on a number you've had with us for a while, by 1:15 PM.",
    )
  })

  it('uses the narrower pause when the policy holds only risky changes', () => {
    POLICY.caseHold = 'risky'
    expect(render(<ReportSheet onClose={() => {}} />)).toContain(
      "We've paused payments to new recipients and changes to your profile, and opened case CASE-M1039-R1255.",
    )
  })

  it('shows three honest states and the fee warning', () => {
    const text = render(<ReportSheet onClose={() => {}} />)
    expect(text).toMatch(/Report received 12:55 PM Recall requested Next .* Money recovered If returned/)
    expect(text).toContain('Asking is not a guarantee.')
    expect(text).toContain('P2P recalls usually fail: 6 of 8 in the kit.')
    expect(text).toContain('Anyone who asks for a fee to get your money back is a scammer.')
    expect(render(<ReportSheet onClose={() => {}} />, reportActions.requestRecall(filed))).toContain(
      'Recall requested Requested',
    )
  })

  it('renders nothing before a report exists', () => {
    expect(render(<ReportSheet onClose={() => {}} />, initialReport)).toBe('')
  })
})

describe('the staff banner', () => {
  it("shows on the reporting member's case with the story clock", () => {
    const text = render(<ReportBanner member="M1039" />)
    expect(text).toContain('Scam reported in the app CASE-M1039-R1255')
    expect(text).toContain('Reported at Tue, Oct 6 · 12:55 PM.')
    expect(text).toContain('Outgoing payments paused while this case is open. Call back by 1:15 PM')
    expect(text).toContain('Request recall')
    expect(render(<ReportBanner member="M1039" />, reportActions.requestRecall(filed))).toContain('Recall requested')
  })

  it("stays off another member's case", () => {
    expect(render(<ReportBanner member="M1003" />)).toBe('')
  })

  it('is mounted on the takeover case and the wire desk', () => {
    expect(render(m1039.steps[0].staff)).toContain('Reported at Tue, Oct 6 · 12:55 PM.')
    const lindaReport = reportActions.file(initialReport, { member: 'M1001', story: 'linda', clock: linda.steps[0].clock })
    expect(render(linda.steps[0].staff, lindaReport)).toContain(`Reported at ${linda.steps[0].clock}.`)
  })
})

describe('where "I think I\'ve been scammed" appears (D9)', () => {
  const zones = sarah.zones!
  const m1039Zones = { member: { tone: 'member', label: "M1039's phone" }, staff: zones.staff } as const
  const sarahZone = (i: number, tone: 'attacker' | 'member') => {
    const html = markup(<BothStage id="x" step={sarah.steps[i]} zones={zones} />)
    return textOf(html.split(`data-zone="${tone}"`)[1].split('data-zone=')[0])
  }

  // The concept look has an app bar on M1039's first screen only; the Sound look on three.
  const m1039AppScreens = { sound: [0, 1, 3], concept: [0] }

  it.each(['concept', 'sound'] as const)("shows on every app screen by default, the scammer's included (%s look)", (variant) => {
    look.current = variant
    expect(sarahZone(0, 'attacker')).toContain(LINK)
    expect(sarahZone(1, 'attacker')).toContain(LINK)
    for (const i of m1039AppScreens[variant]) {
      expect(render(<BothStage id="x" step={m1039.steps[i]} zones={m1039Zones} />)).toContain(LINK)
    }
  })

  it.each(['concept', 'sound'] as const)("keeps it off the scammer's device when the policy is 'real-member' (%s look)", (variant) => {
    look.current = variant
    POLICY.reportLink = 'real-member'
    expect(sarahZone(0, 'attacker')).not.toContain(LINK)
    expect(sarahZone(1, 'attacker')).not.toContain(LINK)
    for (const i of m1039AppScreens[variant]) {
      expect(render(<BothStage id="x" step={m1039.steps[i]} zones={m1039Zones} />)).toContain(LINK)
    }
  })

  it('leaves the link off a screen drawn outside any story, where it could file nothing', () => {
    const alone = textOf(renderToStaticMarkup(<BothStage id="x" step={m1039.steps[0]} zones={m1039Zones} />))
    expect(alone).toContain('Bill Pay')
    expect(alone).not.toContain(LINK)
  })

  it.each(['concept', 'sound'] as const)("puts a Report a scam row on Sarah's real phone at the end (%s look)", (variant) => {
    look.current = variant
    POLICY.reportLink = 'real-member'
    expect(sarahZone(4, 'member')).toContain(`Report a scam ${LINK}`)
    expect(sarahZone(3, 'member')).not.toContain('Report a scam')
  })

  it.each(['concept', 'sound'] as const)("puts a Report a scam row on Linda's tablet when she decides (%s look)", (variant) => {
    look.current = variant
    const lindaZones = { member: { tone: 'member', label: 'Linda: branch tablet' }, staff: zones.staff } as const
    const outcome = linda.steps.findIndex((s) => s.id === 'outcome')
    expect(render(<BothStage id="x" step={linda.steps[outcome]} zones={lindaZones} />)).toContain(`Report a scam ${LINK}`)
  })
})
