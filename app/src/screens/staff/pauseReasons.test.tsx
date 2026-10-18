/** The one sentence on each staff case that says why it exists: kit numbers only, no taps, no dash. */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { HEADS_UP_WINDOW_HOURS } from '../../data/jamesRules'
import { events } from '../../data/kit'
import { FOLLOW_UP_WINDOW_DAYS, PATTERN_MIN_RUN } from '../../data/michaelRules'
import { POLICY } from '../../data/policy'
import { SESSION_WINDOW_HOURS } from '../../data/takeoverRules'
import { TRICKED_RATIO } from '../../data/trickedRules'
import { minutesBetween, money } from '../../ui/format'
import { JAMES_TAPS } from '../james/copy'
import { jamesFacts } from '../james/facts'
import { dollars } from '../linda/facts'
import { TAP_OPTIONS } from '../linda/taps'
import { ROMANCE_OPTIONS, TEST_OPTIONS } from '../michael/check'
import { michaelFacts } from '../michael/facts'
import { gap, whyHeadsUp, whyPattern, whyTakeover, whyTricked, type Why } from './pauseReasons'
import { takeoverFacts } from './takeoverFacts'
import { trickedFacts } from './trickedFacts'
import { WhyPaused } from './WhyPaused'

const linda = trickedFacts('M1001')
const sarah = takeoverFacts('M1003')
const m1039 = takeoverFacts('M1039')
const michael = michaelFacts()
const james = jamesFacts()

const all: [string, Why][] = [
  ['Linda', whyTricked(linda)],
  ['Sarah', whyTakeover(sarah)],
  ['M1039', whyTakeover(m1039)],
  ['Michael, card', whyPattern(michael, 'pattern', michael.card.at)],
  ['Michael, wire', whyPattern(michael, 'wire', michael.wire.at)],
  ['Michael, case', whyPattern(michael, 'report', michael.reported.at)],
  ['James', whyHeadsUp(james)],
]

const tapLabels = [
  ...TAP_OPTIONS.map((o) => o.label),
  ...ROMANCE_OPTIONS.map((o) => o.label),
  ...TEST_OPTIONS.map((o) => o.label),
  ...JAMES_TAPS.map((o) => o.label),
]

const byId = new Map(events.map((e) => [e.id, e]))

/** Minutes between two kit events, read from their own rows. */
const minutes = (from: string, to: string) => minutesBetween(byId.get(from)!.at, byId.get(to)!.at)

afterEach(() => {
  POLICY.sessionRule = false
})

describe('every sentence', () => {
  it.each(all)('%s: one sentence, no dash, no tap the member could keep private', (_, why) => {
    expect(why.line).not.toMatch(/[\u2013\u2014]/)
    expect(why.line.match(/\.(\s|$)/g)).toHaveLength(1)
    for (const label of tapLabels) expect(why.line).not.toContain(label)
    expect(why.line).not.toMatch(/\b(safe|verified|no risk)\b/i)
    expect(why.ids.length).toBeGreaterThan(0)
  })

  it('says how long ago in the unit a person would say', () => {
    const at = new Date(2026, 9, 15, 22, 22)
    expect(gap(new Date(2026, 9, 15, 22, 21), at)).toBe('1 minute')
    expect(gap(new Date(2026, 9, 15, 20, 23), at)).toBe('119 minutes')
    expect(gap(new Date(2026, 9, 14, 20, 9), at)).toBe('26 hours')
    expect(gap(new Date(2026, 9, 10, 22, 22), at)).toBe('5 days')
  })

  it('renders its label, the sentence and the kit rows it cites', () => {
    const why = whyTricked(linda)
    const html = renderToStaticMarkup(<WhyPaused why={why} />).replace(/&#x27;/g, "'")
    expect(html).toContain(why.label)
    expect(html).toContain(why.line)
    expect(html).toContain(why.ids.join(' · '))
  })
})

describe("Linda's wire", () => {
  const { line } = whyTricked(linda)

  it('reads aloud from her wire row and the payee row', () => {
    expect(line).toBe(
      `Paused because the ${dollars(linda.hit.amount)} wire is ${linda.hit.baselineRatio!.toFixed(1)}x her 12-month 90th-percentile payment (the rule's line is ${TRICKED_RATIO}x), goes to an account added ${minutes(linda.recipientAdded.id, linda.hit.id)} minutes earlier, and is her first wire in ${Math.floor(linda.hit.daysSinceLastSameRail! / 365.25)} years.`,
    )
  })

  it('is the per-wire rule on the kit: $8,500 at 4.8x, 7 minutes, 6 years', () => {
    expect(line).toContain('$8,500 wire is 4.8x')
    expect(line).toContain('added 7 minutes earlier')
    expect(line).toContain('first wire in 6 years')
  })
})

describe('the takeover cases', () => {
  it("gives Sarah's full stop: new payee, reset, and email and phone changed unconfirmed", () => {
    const { line } = whyTakeover(sarah)
    expect(line).toBe(
      `Paused because ${money(sarah.hit.amount)} is going to a recipient added ${minutes(sarah.recipientAdded.id, sarah.hit.id)} minutes earlier, ${minutes(sarah.reset.id, sarah.hit.id)} minutes after a password reset, and the email and phone changed in the ${minutes(sarah.changes[0].event.id, sarah.hit.id)} minutes before it, with no confirmation on the prior contact.`,
    )
    expect(line).toContain('$1,574.18 is going to a recipient added 3 minutes earlier, 13 minutes after')
  })

  it("gives M1039's light check: only the address changed, the day before", () => {
    const { line } = whyTakeover(m1039)
    expect(line.startsWith('Paused for one tap because $4,151.68 is going to a recipient added 5 minutes earlier')).toBe(true)
    expect(line).toContain(`${Math.floor(minutes(m1039.reset.id, m1039.hit.id) / 60)} hours after a password reset`)
    expect(line).toContain(`only the address changed, ${Math.floor(minutes(m1039.changes[0].event.id, m1039.hit.id) / 60)} hours before it`)
    expect(line).not.toMatch(/email|phone/)
  })

  it('adds the 2-hour rule only when POLICY turns it on', () => {
    expect(whyTakeover(takeoverFacts('M1003')).line).not.toContain('-hour rule')
    POLICY.sessionRule = true
    expect(whyTakeover(takeoverFacts('M1003')).line).toContain(`the ${SESSION_WINDOW_HOURS}-hour rule fires too`)
    expect(whyTakeover(takeoverFacts('M1039')).line).not.toContain('-hour rule')
  })
})

describe("Michael's case, stage by stage", () => {
  it('calls the card advice, not a pause', () => {
    const { line, label } = whyPattern(michael, 'pattern', michael.card.at)
    expect(label).toBe('Why Michael sees a card')
    expect(line).toBe(
      `No pause, only a card: ${dollars(michael.card.amount)} would be the ${michael.run.length}th payment in ${michael.runDays} days to a payee added Sep 8, each bigger than the last (the card starts at the ${PATTERN_MIN_RUN}th), and Send still works.`,
    )
    expect(michael.run.map((e) => e.amount)).toEqual([87.95, 132.93, 220.12, 306.77])
  })

  it('pauses the wire for a call, from his wire and payee rows', () => {
    const { line } = whyPattern(michael, 'wire', michael.wire.at)
    expect(line).toBe(
      `Paused for a call because the ${dollars(michael.wire.amount)} wire, his first ever, goes to an account added ${minutes(michael.wirePayeeAdded.id, michael.wire.id)} minutes earlier, ${michael.cardToWireDays} days after a pattern card on a different payee (the rule's window is ${FOLLOW_UP_WINDOW_DAYS} days).`,
    )
    expect(line).toContain('$1,500 wire')
  })

  it('counts only the wires up to the story clock', () => {
    expect(whyPattern(michael, 'report', michael.reported.at).line).toContain('3 wires so far')
    expect(whyPattern(michael, 'report', michael.wire.at).line).toContain('1 wire so far')
  })
})

describe("James's heads-up", () => {
  it('says no hold, from the call row and the cash row', () => {
    const { line, label } = whyHeadsUp(james)
    expect(label).toBe('Why the teller sees this')
    expect(line).toBe(
      `No hold, only a heads-up: a ${dollars(james.cash.amount)} cash withdrawal starts ${Math.floor(minutes(james.call.id, james.cash.id) / 60)} hours after James called the contact center, inside the rule's ${HEADS_UP_WINDOW_HOURS} hours.`,
    )
    expect(line).toContain('$7,000 cash withdrawal starts 26 hours after')
    expect(line).not.toContain(james.topic)
  })
})
