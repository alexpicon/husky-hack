/** The withdrawal test on the card and the held wire, "Not now", and how every answer carries forward. */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { michael } from '../../story/michael'
import { MemberPhone } from '../m1039/MemberPhone'
import { checkActions, initialCheck, staffView, TEST_OPTIONS, type MichaelCheck } from './check'
import { writeCheck } from './checkState'
import { michaelFacts, romanceScript, WITHDRAWAL_CHECK, WITHDRAWAL_QUESTION, wireFact } from './facts'
import { ReportHome } from './ReportHome'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .trim()

const [cardStep, wireStep, reportStep] = michael.steps
const html = (node: React.ReactNode) => renderToStaticMarkup(<>{node}</>)
const text = (node: React.ReactNode) => textOf(html(node))
const set = (c: Partial<MichaelCheck>) => writeCheck({ ...initialCheck, v: 1, ...c })
const FAILED = TEST_OPTIONS.find((o) => o.id === 'failed')!

describe('answers are final, and a new start clears them', () => {
  const answered: MichaelCheck = { ...initialCheck, card: 'not-now', wire: 'cancel', test: 'failed' }

  it('keeps the first answer when a late tap arrives', () => {
    expect(checkActions.card(answered, 'send')).toBe(answered)
    expect(checkActions.wire(answered, 'wait')).toBe(answered)
    expect(checkActions.test(answered, 'worked')).toBe(answered)
  })

  it('clears them on the first step and on a new run', () => {
    expect(checkActions.reset({ ...answered, run: 3, v: 9 })).toEqual({ ...initialCheck, run: 3, v: 9 })
    expect(checkActions.forRun(answered, 1)).toEqual({ ...initialCheck, run: 1 })
  })

  it('shows staff his test answer only if he shares it', () => {
    expect(staffView(answered).test).toBeNull()
    expect(staffView({ ...answered, shared: true }).test).toBe('failed')
  })
})

describe.each(['concept', 'sound'] as const)('the withdrawal test (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
    set({})
  })

  it.each([[[]], [['never-met', 'investment']], [['none']]] as const)('puts the check on the card after taps %j', (taps) => {
    set({ taps: [...taps] })
    const page = text(cardStep.member)
    expect(page).toContain(`${WITHDRAWAL_CHECK.title} ${WITHDRAWAL_CHECK.body}`)
    expect(WITHDRAWAL_CHECK.body).toBe(
      "Try taking $100 out of the platform. Real platforms let you. If you can't, or they ask for a fee or tax first, stop and call us.",
    )
    expect(page).toContain('Not now')
  })

  it('leaves it off for a member paying his own account', () => {
    set({ taps: ['own'] })
    expect(text(cardStep.member)).not.toContain(WITHDRAWAL_CHECK.body)
  })

  it('asks it on the held wire before the call, with the call timing unchanged', () => {
    const page = text(wireStep.member)
    expect(page).toContain('Before Sound calls you Did the withdrawal test work?')
    for (const o of TEST_OPTIONS) expect(page).toContain(o.label)
    expect(TEST_OPTIONS.map((o) => o.label)).toEqual([
      'Yes, I took money out',
      'No, or they asked for a fee first',
      "I haven't tried",
    ])
    expect(page).toContain('A specialist will call you before 8 PM tonight')
    expect(page).not.toContain('11:25')
  })

  it('answers "No, or a fee" once, keeps the wire on hold, and tells staff only if he shares', () => {
    set({ test: 'failed' })
    const member = text(wireStep.member)
    expect(member).toContain("That's how these scams keep you paying. Your wire stays on hold, and a specialist will call you.")
    expect(member).not.toContain("I haven't tried")
    expect(member).toContain("Wait for Sound's call")
    expect(text(wireStep.staff)).not.toContain(FAILED.label)
    expect(text(wireStep.staff)).toContain('withdrawal-test answer stays on his screen unless he shares it')
    set({ test: 'failed', shared: true })
    expect(text(wireStep.staff)).toContain(`He shared his withdrawal test: "${FAILED.label}"`)
    expect(text(reportStep.staff)).toContain(`Withdrawal test, shared: "${FAILED.label}"`)
  })

  it('opens the staff call script with the withdrawal question', () => {
    expect(romanceScript(michaelFacts())[0]).toBe('Have you been able to withdraw from the platform?')
    expect(text(wireStep.staff)).toContain(`Call script · Relationship investment scam 1 ${WITHDRAWAL_QUESTION}`)
  })

  it('carries "Not now" to the held wire, the day he reports and the staff case', () => {
    set({ card: 'not-now' })
    expect(text(cardStep.member)).toContain('Nothing was sent.')
    expect(text(cardStep.member)).not.toContain('Send $306.77')
    expect(text(cardStep.staff)).toContain('Card shown · no hold · $306.77 not sent')
    expect(wireFact(michaelFacts(), false)).toContain('after 3 growing payments to someone else')
    for (const page of [text(wireStep.member), text(wireStep.staff)]) expect(page).toContain(wireFact(michaelFacts(), false))
    const report = text(reportStep.member)
    expect(report).toContain('Sep 21 · P2P · Not now, not sent')
    expect(report).not.toContain('-$306.77')
    expect(report).toContain('Here he chose Not now on the $306.77 payment, so it never left his account.')
    expect(text(reportStep.staff)).toContain('He chose Not now, so it was not sent.')
  })

  it('shows the 4th payment as sent after Send', () => {
    set({ card: 'send' })
    expect(text(wireStep.member)).toContain('after 4 growing payments')
    expect(text(reportStep.member)).toContain('-$306.77')
    expect(text(reportStep.staff)).toContain('Pattern card shown · $306.77 P2P No hold. He sent it.')
  })

  it('never shows a kit event ID on his phone or his online banking screen', () => {
    set({ taps: ['never-met', 'investment'], shared: true, test: 'failed', card: 'not-now' })
    for (const page of [html(cardStep.member), html(wireStep.member), html(<MemberPhone time="5:16 PM"><ReportHome /></MemberPhone>)]) {
      expect(page).not.toMatch(/\bE\d{5}\b/)
    }
  })

  it('points at the fee line in the report', () => {
    expect(text(reportStep.member)).toContain('anyone who asks for a fee to get your money back is a scammer')
  })
})
