/** The contact center agent's choice at step one: final once logged, shared, and read by the teller and the case. */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { birth, change, newPeer, receive, type Peer } from '../../shell/handshake'
import { james } from '../../story/james'
import { clock } from '../../ui/format'
import type { AgentChoice } from './agent'
import { answerActions, initialAnswers, outbound, type JamesAnswers } from './answers'
import { changeAnswers, readAnswers, receiveAnswers, writeAnswers } from './answersState'
import { jamesFacts } from './facts'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The look switch and the answers sync across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const text = (node: ReactNode) =>
  renderToStaticMarkup(<>{node}</>)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .replace(/ ([.,;])/g, '$1')

const [call, teller, outcome] = james.steps
const f = jamesFacts()
const LINKED = 'Contact center call · linked to this case About the daily cash limit and how fast a wire arrives.'

const choices: [AgentChoice, string][] = [
  ['clear', 'the agent asked; no concern'],
  ['hesitated', 'the agent asked; he hesitated'],
  ['transfer', 'the agent asked; transferred to a specialist'],
]

describe.each(['concept', 'sound'] as const)("the agent's choice carries forward (%s look)", (variant) => {
  beforeEach(() => {
    look.current = variant
    writeAnswers(initialAnswers)
  })

  it('adds nothing to the teller or the case when the agent logged nothing', () => {
    expect(text(teller.staff)).not.toContain('the agent asked')
    expect(text(teller.staff)).toContain('No case yet')
    const staff = text(outcome.staff)
    expect(staff).toContain(LINKED)
    expect(staff).not.toMatch(/agent asked/i)
  })

  it.each(choices)('%s reaches the teller and the case, whichever way the cash ends', (choice, line) => {
    changeAnswers((a) => answerActions.agent(a, choice))
    expect(text(call.staff)).toContain('Case open · call logged')
    expect(text(teller.staff)).toContain("Case open since yesterday's call")
    expect(text(teller.staff)).toContain(`Yesterday: ${line}.`)
    expect(text(outcome.staff)).toContain(`${LINKED} T${line.slice(1)}.`)
    changeAnswers((a) => answerActions.teller(a, 'continue'))
    expect(text(outcome.staff)).toContain(`${LINKED} T${line.slice(1)}.`)
    expect(text(outcome.staff)).toContain('Cash handed over')
  })

  it('keeps the first choice: a second tap changes nothing', () => {
    changeAnswers((a) => answerActions.agent(a, 'hesitated'))
    const before = readAnswers()
    changeAnswers((a) => answerActions.agent(a, 'clear'))
    expect(readAnswers()).toBe(before)
    expect(text(call.staff)).toContain('Logged: he hesitated')
  })

  it("lists the call first, then the kit's afternoon in order, none after the step clock", () => {
    changeAnswers((a) => answerActions.agent(a, 'hesitated'))
    const staff = text(outcome.staff)
    const rows = [f.call, f.cash, f.confirm, f.escalated, f.offered, f.enrolled, f.cancelled, f.opened]
    const at = rows.map((e) => staff.indexOf(`${clock(e.at)} `))
    expect(at.every((i) => i > -1)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
    for (const e of rows) expect(e.at.getTime()).toBeLessThanOrEqual(f.opened.at.getTime())
    expect(staff).toContain('Wed, Oct 14 · Contact Center')
    expect(staff).toContain('Thu, Oct 15 · Branch')
  })
})

type Win = { store: typeof import('./answersState'); steps: typeof james.steps; peer: Peer }

/** A fresh copy of the app, as another laptop would load it. */
async function openWindow(): Promise<Win> {
  vi.resetModules()
  const store = await import('./answersState')
  const { james: story } = await import('../../story/james')
  return { store, steps: story.steps, peer: change(newPeer(birth()), JSON.stringify(outbound(store.readAnswers()))).peer }
}

/** What each window's sync does after a render: send its outbound copy, and the other applies it. */
function relay(from: Win, to: Win) {
  const sent = change(from.peer, JSON.stringify(outbound(from.store.readAnswers())))
  from.peer = sent.peer
  if (!sent.send) return
  const got = receive(to.peer, sent.send)
  to.peer = got.peer
  if (got.apply !== undefined) to.store.receiveAnswers(JSON.parse(got.apply) as JamesAnswers)
}

describe('two windows, as on two laptops', () => {
  it("show the agent's choice in both", async () => {
    const member = await openWindow()
    const staff = await openWindow()
    staff.store.changeAnswers((a) => answerActions.agent(a, 'transfer'))
    relay(staff, member)
    expect(member.store.readAnswers()).toEqual(staff.store.readAnswers())
    expect(text(member.steps[1].staff)).toContain('Yesterday: the agent asked; transferred to a specialist.')
  })

  it('read a copy saved before the agent choice existed', () => {
    writeAnswers({ ...initialAnswers, v: 1 })
    const old: Omit<JamesAnswers, 'agent'> = { run: 0, v: 5, taps: [], teller: ['ask'] }
    receiveAnswers(old as JamesAnswers)
    expect(readAnswers()).toEqual({ ...initialAnswers, v: 5, teller: ['ask'] })
  })
})
