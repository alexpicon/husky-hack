/** James's answers: one copy for every window, a fresh one each run, and step three follows the teller. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { events } from '../../data/kit'
import { birth, change, newPeer, receive, type Peer } from '../../shell/handshake'
import { james } from '../../story/james'
import { answerActions, initialAnswers, type JamesAnswers } from './answers'
import { changeAnswers, readAnswers, receiveAnswers, startRun, writeAnswers } from './answersState'
import { CALL_AGENCY, HANDED_OVER, SCAM_NAMED } from './copy'
import { jamesFacts } from './facts'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The look switch and the answers sync across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const html = (node: ReactNode) => renderToStaticMarkup(<>{node}</>)
const text = (node: ReactNode) =>
  html(node)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .replace(/ ([.,])/g, '$1')

const byId = new Map(events.map((e) => [e.id, e]))
const [, teller, outcome] = james.steps
const KIT_LINE =
  'In the kit, without Second Look: the teller asked this question and the $7,000 stayed with James. In 5 other government journeys, $35,500 in cash went out.'

describe.each(['concept', 'sound'] as const)('step three follows the teller (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
    writeAnswers(initialAnswers)
  })

  it('keeps the kit ending when the teller escalates', () => {
    changeAnswers((a) => answerActions.teller(a, 'ask'))
    changeAnswers((a) => answerActions.teller(a, 'escalate'))
    const [member, staff] = [text(outcome.member), text(outcome.staff)]
    expect(outcome.title).toBe('He asks for help, and the cash stays')
    expect(member).toContain('Your cash stays with you.')
    expect(member).not.toContain('handed over')
    expect(staff).toContain('Withdrawal cancelled by James')
    expect(staff).toContain(KIT_LINE)
  })

  it('hands the cash over when the teller continues, citing nothing after the withdrawal', () => {
    changeAnswers((a) => answerActions.teller(a, 'ask'))
    changeAnswers((a) => answerActions.teller(a, 'continue'))
    const [member, staff] = [text(outcome.member), text(outcome.staff)]
    expect(outcome.title).toBe('He goes ahead, and the cash is handed over')
    expect(outcome.caption).not.toMatch(/cancel|asks for help/)
    expect(member).toContain('The $7,000 was handed over.')
    expect(member).toContain(HANDED_OVER)
    expect(member).toContain(CALL_AGENCY)
    expect(member).not.toContain('stays with you')
    expect(staff).toContain('Cash handed over')
    expect(staff).toContain("Withdrawal continued at James's decision $7,000 handed over in cash. Cash can't be recalled.")
    expect(staff).toContain(`Case opened ${jamesFacts().caseId} · James can report it any time`)
    expect(staff).not.toMatch(/cancelled|stays in his account|specialist/i)
    expect(staff).toContain(KIT_LINE)
    for (const node of [outcome.member, outcome.staff]) {
      const cited = [...html(node).matchAll(/E\d{5}/g)].map((m) => byId.get(m[0])!)
      for (const e of cited) expect(e.at.getTime()).toBeLessThanOrEqual(jamesFacts().cash.at.getTime())
      expect(text(node)).not.toMatch(/[\u2013\u2014]/)
    }
  })
})

describe('the teller buttons', () => {
  beforeEach(() => writeAnswers(initialAnswers))

  it('ends the heads-up once: continuing after escalating changes nothing', () => {
    changeAnswers((a) => answerActions.teller(a, 'escalate'))
    const before = readAnswers()
    changeAnswers((a) => answerActions.teller(a, 'continue'))
    expect(readAnswers()).toBe(before)
    expect(text(teller.staff)).toContain('With a specialist')
  })
})

type Win = { store: typeof import('./answersState'); steps: typeof james.steps; peer: Peer }

/** A fresh copy of the app, as another laptop would load it. */
async function openWindow(): Promise<Win> {
  vi.resetModules()
  const store = await import('./answersState')
  const { james: story } = await import('../../story/james')
  return { store, steps: story.steps, peer: change(newPeer(birth()), JSON.stringify(store.readAnswers())).peer }
}

/** What each window's sync does after a render: send its change, and the other applies it. */
function relay(from: Win, to: Win) {
  const sent = change(from.peer, JSON.stringify(from.store.readAnswers()))
  from.peer = sent.peer
  if (!sent.send) return
  const got = receive(to.peer, sent.send)
  to.peer = got.peer
  if (got.apply !== undefined) to.store.receiveAnswers(JSON.parse(got.apply) as JamesAnswers)
}

const pressed = (node: ReactNode) => html(node).match(/aria-pressed="true"/g)?.length ?? 0

describe('two windows, as on two laptops', () => {
  it('show his taps and the teller choice in both', async () => {
    const member = await openWindow()
    const staff = await openWindow()
    member.store.changeAnswers((a) => answerActions.tap(a, 'investigation'))
    member.store.changeAnswers((a) => answerActions.tap(a, 'secret'))
    expect(pressed(staff.steps[1].member)).toBe(0)
    relay(member, staff)
    expect(pressed(staff.steps[1].member)).toBe(2)
    expect(text(staff.steps[1].member)).toContain(SCAM_NAMED)

    staff.store.changeAnswers((a) => answerActions.teller(a, 'continue'))
    relay(staff, member)
    expect(member.store.readAnswers()).toEqual(staff.store.readAnswers())
    expect(text(member.steps[1].staff)).toContain('Withdrawal continued')
    expect(text(member.steps[2].member)).toContain('The $7,000 was handed over.')
    expect(text(staff.steps[2].staff)).toContain('Cash handed over')
  })

  it('keep the newer copy when a stale one arrives', () => {
    writeAnswers(initialAnswers)
    changeAnswers((a) => answerActions.teller(a, 'continue'))
    const newer = readAnswers()
    receiveAnswers({ ...initialAnswers, v: newer.v - 1, teller: ['escalate'] })
    expect(readAnswers()).toEqual(newer)
  })

  it('start empty on a new run, and an earlier run never comes back', () => {
    writeAnswers({ ...initialAnswers, run: 2, v: 9, taps: ['secret'], teller: ['continue'] })
    startRun(3)
    expect(readAnswers()).toEqual({ ...initialAnswers, run: 3 })
    receiveAnswers({ ...initialAnswers, run: 2, v: 20, teller: ['continue'] })
    expect(readAnswers().teller).toEqual([])
    startRun(2)
    expect(readAnswers().run).toBe(3)
  })

  it('start empty when the story is back on step one', () => {
    writeAnswers({ ...initialAnswers, run: 1, v: 4, taps: ['move'], teller: ['ask', 'continue'] })
    changeAnswers(answerActions.reset)
    expect(readAnswers()).toEqual({ ...initialAnswers, run: 1, v: 5 })
  })
})
