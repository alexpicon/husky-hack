/** James's story: kit facts only, nothing after the story clock, and the check says only what his taps support. */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { events } from '../../data/kit'
import { BothStage } from '../../shell/Stages'
import { james } from '../../story/james'
import { clock, day } from '../../ui/format'
import { TellerHeadsUp } from '../staff/TellerHeadsUp'
import { TellerOutcome } from '../staff/TellerOutcome'
import {
  AGENCIES,
  CALL_AGENCY,
  checkReply,
  COACHING_QUESTION,
  FOLLOW_UP,
  PRIVATE_REPLY,
  QUESTION,
  SCAM_NAMED,
  type JamesTapId,
} from './copy'
import { CallCenter } from '../staff/CallCenter'
import { AGENT_QUESTION, CALL_REASON, PILOT_LABEL } from './agent'
import { jamesFacts } from './facts'
import { JamesCheck } from './JamesCheck'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The look switch and the answers sync across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .replace(/ ([.,])/g, '$1')

const f = jamesFacts()
const clockOf: Record<string, Date> = { call: f.call.at, teller: f.cash.at, outcome: f.opened.at }
const byId = new Map(events.map((e) => [e.id, e]))

describe('the kit behind the story', () => {
  it('reads the call, the cash and the ending from the kit', () => {
    expect(`${day(f.call.at)} ${clock(f.call.at)}`).toBe('Wed, Oct 14 2:04 PM')
    expect(f.topic).toBe('about the daily cash limit and how fast a wire arrives')
    expect([f.cash.amount, f.cash.rail, clock(f.cash.at), f.ratio]).toEqual([7000, 'Cash', '4:17 PM', 4.71])
    expect(f.confirm.note).toContain(QUESTION)
    expect(f.confirm.memberResponse).toBe('Requested Help')
    expect(f.offered.memberResponse).toBe('Accepted Offer')
    expect(clock(f.cancelled.at)).toBe('4:55 PM')
    expect([f.unasked.payments.length, f.unasked.total]).toEqual([5, 35_500])
  })

  it("holds the pilot's reason code to the kit's own note on the call", () => {
    expect(f.call.note).toMatch(/daily cash limit/)
    expect(f.call.note).toMatch(/wire/)
    expect(CALL_REASON).toBe('asked about daily cash limit and wire speed')
  })
})

describe.each(['concept', 'sound'] as const)('every step (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
  })

  it.each(james.steps.map((s) => [s.id, s] as const))('%s never cites a row after its clock', (id, step) => {
    expect(step.clock).toBe(`${day(clockOf[id])} · ${clock(clockOf[id])}`)
    const html = renderToStaticMarkup(<BothStage id={id} step={step} zones={james.zones!} />)
    const cited = [...html.matchAll(/E\d{5}/g)].map((m) => byId.get(m[0])!)
    expect(cited.length).toBeGreaterThan(0)
    for (const e of cited) expect(e.at.getTime()).toBeLessThanOrEqual(clockOf[id].getTime())
    expect(textOf(html)).not.toMatch(/[\u2013\u2014]/)
  })

  it('shows the true fact and the call-back line before any tap, and names no scam', () => {
    const text = textOf(renderToStaticMarkup(<JamesCheck />))
    expect(text).toContain('You asked us yesterday about the daily cash limit and how fast a wire arrives.')
    expect(text).toContain(
      'The government never asks you to move money to keep it safe. Call the agency on a number you look up yourself.',
    )
    expect(text).toContain(CALL_AGENCY)
    expect(text).toContain('Someone told me what to say to the bank')
    expect(text).not.toContain(SCAM_NAMED)
  })
})

describe('the silent check', () => {
  const cases: [JamesTapId[], string | null][] = [
    [[], null],
    [['none'], null],
    [['secret'], null],
    [['investigation', 'secret'], SCAM_NAMED],
    [['coached'], null],
    [['coached', 'move'], SCAM_NAMED],
    [['move', 'waiting', 'secret'], SCAM_NAMED],
    [['investigation', 'secret', 'private'], PRIVATE_REPLY],
  ]
  it.each(cases)('%j says %s', (taps, said) => {
    const reply = checkReply(taps)
    expect(reply.said).toBe(said)
    expect(reply.agencies).toBe(said === SCAM_NAMED ? AGENCIES : null)
  })
})

describe('the contact center agent, a pilot concept', () => {
  it('sees the reason code, one question and three choices, with no hold', () => {
    const text = textOf(renderToStaticMarkup(<CallCenter />))
    expect(text).toContain(PILOT_LABEL)
    expect(text).toContain("Pilot concept: uses the call's reason code, never the call itself.")
    expect(text).toContain('Call reason: asked about daily cash limit and wire speed')
    expect(text).toContain('Scammers often coach members to ask this first.')
    expect(text).toContain(`Ask: "${AGENT_QUESTION}"`)
    for (const b of ['Asked: no concern', 'Asked: he hesitated', 'Transfer to a specialist']) expect(text).toContain(b)
    expect(text).toContain("No hold. Logged on James's case.")
  })

  it('shows nothing from the next day', () => {
    const text = textOf(renderToStaticMarkup(<CallCenter />))
    expect(text).not.toMatch(/\$7,000|P1004-004|CASE-|4:17/)
  })
})

describe('the teller', () => {
  it('sees the call, the cash and one question, with no hold', () => {
    const text = textOf(renderToStaticMarkup(<TellerHeadsUp />))
    expect(text).toContain(
      'Yesterday at 2:04 PM James called the contact center about the daily cash limit and how fast a wire arrives. Today: $7,000 cash.',
    )
    expect(text).toContain('4.71x his 12-month 90th-percentile payment')
    expect(text).toContain(`Ask first "Has anyone told you what to say to us today?" Then: "...or to keep this secret, or to stay on the phone?"`)
    expect([COACHING_QUESTION, FOLLOW_UP].every((q) => text.includes(q))).toBe(true)
    expect(text).toContain('No hold. You and James decide.')
    for (const b of ['Ask the question', 'Offer the private tablet check', 'Escalate to a specialist', "Continue: James's decision"]) {
      expect(text).toContain(b)
    }
  })

  it('reads the kit comparison only after its label', () => {
    const text = textOf(renderToStaticMarkup(<TellerOutcome />))
    const label = text.indexOf('In the kit, without Second Look:')
    expect(label).toBeGreaterThan(-1)
    expect(text).toContain(
      "In the kit, 5 others in this scam weren't asked: $35,500 left the branch. The heads-up makes the question happen every time.",
    )
    expect(text.indexOf('$35,500')).toBeGreaterThan(label)
  })
})

const sources = import.meta.glob(
  [
    './*.{ts,tsx}',
    '!./*.test.{ts,tsx}',
    '../staff/Teller*.tsx',
    '../staff/CallCenter*.tsx',
    '../../story/james.tsx',
    '../../data/jamesRules.ts',
  ],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
) as Record<string, string>

describe('the answer key stays out of James', () => {
  it('finds the files it checks', () => {
    expect(Object.keys(sources)).toEqual(
      expect.arrayContaining([
        './facts.ts',
        './agent.ts',
        '../staff/TellerHeadsUp.tsx',
        '../staff/CallCenter.tsx',
        '../../story/james.tsx',
        '../../data/jamesRules.ts',
      ]),
    )
  })

  it.each(Object.keys(sources))('%s never reads the Member Key', (file) => {
    expect(sources[file]).not.toMatch(/keyFor|memberKeys|MemberKey|Member_Key/)
  })
})
