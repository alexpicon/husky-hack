/** Michael's story: facts from the kit, the check's answers, and every step in both looks. */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { eventsFor } from '../../data/kit'
import { michael } from '../../story/michael'
import { clock } from '../../ui/format'
import { checkActions, initialCheck, mergeChecks, romanceFit, staffView, toggleTap, type MichaelTap } from './check'
import { writeCheck } from './checkState'
import { MICHAEL, michaelFacts, patternFact, ROMANCE_LINE, wireFact } from './facts'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The look switch and the check sync across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .trim()

describe("Michael's facts, from his events", () => {
  const f = michaelFacts()

  it('words the pattern card from the four growing payments', () => {
    expect(patternFact(f)).toBe(
      'This would be your 4th payment in 13 days to someone you added on Sep 8, each bigger than the last: $87.95, $132.93, $220.12, $306.77.',
    )
  })

  it('words the held wire from his first wire and its payee', () => {
    expect(wireFact(f)).toBe(
      'This would be your first wire ever, to an account added 17 minutes ago, after 4 growing payments to someone else you added on Sep 8.',
    )
    expect(f.wires.map((e) => e.amount)).toEqual([1500, 2400, 3840])
    expect(clock(f.holdEnds)).toBe('8:00 PM')
  })

  it('splits what he lost at the card: $441 already gone, $8,046.77 after it', () => {
    expect(f.lost).toBe(8487.77)
    expect(f.alreadySent).toBe(441)
    expect(f.fromCard).toBe(8046.77)
    expect(f.alreadySent + f.fromCard).toBeCloseTo(f.lost, 2)
  })

  it('finds $7,740 of his $8,487.77 moved after the turn to wires', () => {
    expect(f.sent).toBe(8487.77)
    expect(f.wired).toBe(7740)
    expect(f.wired).toBe(f.wires.reduce((s, e) => s + e.amount, 0))
    expect(f.alreadySent + f.card.amount + f.wired).toBeCloseTo(f.sent, 2)
  })

  it('finds his report, and the warnings he confirmed', () => {
    expect(f.reported.at).toEqual(new Date(2026, 9, 10, 17, 16))
    expect(f.reported.channel).toBe('Contact Center')
    expect(f.warnings.map((w) => w.memberResponse)).toEqual(Array(4).fill('Confirmed Intended'))
  })
})

describe('the silent check', () => {
  it('lets "None of these" and "my own account" stand alone', () => {
    expect(toggleTap(['never-met', 'investment'], 'none')).toEqual(['none'])
    expect(toggleTap(['none'], 'own')).toEqual(['own'])
    expect(toggleTap(['own'], 'secret')).toEqual(['secret'])
    expect(toggleTap(['secret'], 'secret')).toEqual([])
  })

  it('adds several taps at once by the same rules, never turning one off', () => {
    const add = (taps: MichaelTap[], ids: MichaelTap[]) => checkActions.addTaps({ ...initialCheck, taps }, ids).taps
    expect(add([], ['investment', 'never-met'])).toEqual(['never-met', 'investment'])
    expect(add(['never-met', 'secret'], ['never-met', 'investment'])).toEqual(['never-met', 'investment', 'secret'])
    expect(add(['none'], ['secret'])).toEqual(['secret'])
    expect(add(['own'], ['emergency'])).toEqual(['emergency'])
    const tapped = { ...initialCheck, taps: ['secret'] as MichaelTap[] }
    expect(checkActions.addTaps(tapped, ['secret'])).toBe(tapped)
    expect(checkActions.addTaps(tapped, [])).toBe(tapped)
  })

  it('names the scam only on 2 or more fitting taps', () => {
    expect(romanceFit(['never-met'])).toBeNull()
    expect(romanceFit(['never-met', 'investment'])).toEqual(['never-met', 'investment'])
    expect(romanceFit(['own'])).toBeNull()
  })

  it('shows staff his taps only if he shares them', () => {
    const tapped = { ...initialCheck, taps: toggleTap([], 'investment') }
    expect(staffView(tapped).taps).toEqual([])
    expect(staffView({ ...tapped, shared: true }).taps).toEqual(['investment'])
    expect(staffView({ ...initialCheck, taps: ['own'] }).ownAccount).toBe(true)
  })

  it('settles two windows on the same check', () => {
    const a = { ...initialCheck, v: 2, mv: 1, taps: toggleTap([], 'secret') }
    const b = { ...initialCheck, v: 3, mv: 2, shared: true }
    expect(mergeChecks(a, b)).toBe(b)
    expect(mergeChecks(b, a)).toBe(b)
  })
})

describe.each(['concept', 'sound'] as const)('every step (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
  })

  it.each(michael.steps.map((s) => [s.id, s] as const))('step %s renders, with no dash and nothing after its clock', (_, step) => {
    const member = renderToStaticMarkup(<>{step.member}</>)
    const staff = renderToStaticMarkup(<>{step.staff}</>)
    const f = michaelFacts()
    const now = { pattern: f.card.at, wire: f.wire.at, report: f.reported.at }[step.id]!
    expect(step.clock).toContain(clock(now))
    const later = eventsFor(MICHAEL).filter((e) => e.at > now)
    for (const html of [member, staff]) {
      expect(textOf(html)).not.toMatch(/[\u2013\u2014]/)
      for (const e of later) expect(html).not.toMatch(new RegExp(`\\b${e.id}\\b`))
    }
  })

  it('opens on the card, with Send still there and the trusted line for everyone', () => {
    const text = textOf(renderToStaticMarkup(<>{michael.steps[0].member}</>))
    expect(text).toContain(patternFact())
    expect(text).toContain('Talk to someone you trust before you send more.')
    expect(text).toContain('Send $306.77')
    expect(text).not.toContain('investment scam')
  })

  it('keeps staff on the card with no hold and no taps until he shares', () => {
    const text = textOf(renderToStaticMarkup(<>{michael.steps[0].staff}</>))
    expect(text).toContain('Card shown · no hold')
    expect(text).toContain('Answers private')
  })

  it('holds the wire with the true fact and the call script', () => {
    const member = textOf(renderToStaticMarkup(<>{michael.steps[1].member}</>))
    const staff = textOf(renderToStaticMarkup(<>{michael.steps[1].staff}</>))
    expect(member).toContain(wireFact())
    expect(member).toContain('Held until 8:00 PM')
    expect(staff).toContain('Call script · Relationship investment scam')
  })

  it('labels the kit loss and never calls the rest saved', () => {
    const text = textOf(renderToStaticMarkup(<>{michael.steps[2].member}</>))
    const label = text.indexOf('In the kit, without Second Look')
    expect(label).toBeGreaterThan(-1)
    expect(text.indexOf('$8,487.77')).toBeGreaterThan(label)
    expect(text).toContain('$441.00 was already gone')
    expect(text).toContain('it is not money saved')
  })
})

describe.each(['concept', 'sound'] as const)('his taps on the card (%s look)', (variant) => {
  const [member, staff] = [michael.steps[0].member, michael.steps[0].staff]
  const text = (node: typeof member) => textOf(renderToStaticMarkup(<>{node}</>))
  beforeEach(() => {
    look.current = variant
    writeCheck(initialCheck)
  })

  it('names the scam on two fitting taps, and staff see them only once he shares', () => {
    writeCheck({ ...initialCheck, v: 1, taps: ['never-met', 'investment'] })
    expect(text(member)).toContain(ROMANCE_LINE)
    expect(text(staff)).toContain('Answers private')
    expect(text(staff)).not.toContain("We've never met in person")
    writeCheck({ ...initialCheck, v: 2, taps: ['never-met', 'investment'], shared: true })
    expect(text(staff)).toContain('Taps fit a relationship investment scam')
    expect(text(staff)).toContain("We've never met in person")
  })

  it('keeps his share switch on screen while he shares, even with every tap cleared', () => {
    const html = () => renderToStaticMarkup(<>{member}</>)
    expect(html()).not.toContain('role="switch"')
    writeCheck({ ...initialCheck, v: 1, taps: ['secret'] })
    expect(html()).toMatch(/role="switch" aria-checked="false"/)
    writeCheck({ ...initialCheck, v: 2, shared: true })
    expect(html()).toMatch(/role="switch" aria-checked="true"/)
  })

  it('stops asking about a payee he marks as his own account, and tells staff why', () => {
    writeCheck({ ...initialCheck, v: 1, taps: ['own'] })
    expect(text(member)).toContain("We won't ask about this payee again.")
    expect(text(member)).not.toContain(ROMANCE_LINE)
    expect(text(staff)).toContain('He marked this payee as his own account.')
  })
})
