/**
 * James's answers: one copy for every window but his taps, bar asking to talk privately, a fresh one
 * each run, and step three follows the teller.
 */
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { events } from '../../data/kit'
import { birth, change, newPeer, receive, type Peer } from '../../shell/handshake'
import { james } from '../../story/james'
import { answerActions, initialAnswers, outbound, type JamesAnswers, type TellerAction } from './answers'
import { changeAnswers, readAnswers, receiveAnswers, startRun, writeAnswers } from './answersState'
import { CALL_AGENCY, GOING_AHEAD, HANDED_OVER, JAMES_TAPS, SCAM_NAMED, type JamesTapId } from './copy'
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
  "In the kit, without Second Look: one teller happened to ask James, and the $7,000 stayed with him. In the kit, 5 others in this scam weren't asked: $35,500 left the branch. The heads-up makes the question happen every time."

describe.each(['concept', 'sound'] as const)('step three follows the teller (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
    writeAnswers(initialAnswers)
  })

  it('keeps the kit ending when the teller escalates', () => {
    changeAnswers((a) => answerActions.teller(a, 'ask'))
    changeAnswers((a) => answerActions.teller(a, 'escalate'))
    const [member, staff] = [text(outcome.member), text(outcome.staff)]
    expect(outcome.title).toBe('One case across departments: the cash stays')
    expect(member).toContain('Your cash stays with you.')
    expect(member).not.toContain('handed over')
    expect(staff).toContain('Withdrawal cancelled by James')
    expect(staff).toContain(KIT_LINE)
  })

  it('hands the cash over when the teller continues, citing nothing after the withdrawal', () => {
    changeAnswers((a) => answerActions.teller(a, 'ask'))
    changeAnswers((a) => answerActions.teller(a, 'continue'))
    const [member, staff] = [text(outcome.member), text(outcome.staff)]
    expect(outcome.title).toBe('One case across departments: the cash is handed over')
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

describe('adding several taps at once', () => {
  it('turns on each listed tap by the same rules, never turning one off', () => {
    const add = (taps: JamesTapId[], ids: JamesTapId[]) => answerActions.addTaps({ ...initialAnswers, taps }, ids).taps
    expect(add([], ['secret', 'investigation'])).toEqual(['investigation', 'secret'])
    expect(add(['move'], ['move', 'coached'])).toEqual(['move', 'coached'])
    expect(add(['none', 'private'], ['waiting'])).toEqual(['waiting', 'private'])
    const tapped = { ...initialAnswers, taps: ['move'] as JamesTapId[] }
    expect(answerActions.addTaps(tapped, ['move'])).toBe(tapped)
    expect(answerActions.addTaps(tapped, [])).toBe(tapped)
  })

  it('adds nothing once the teller goes on with the withdrawal', () => {
    const over = { ...initialAnswers, teller: ['continue'] as TellerAction[] }
    expect(answerActions.addTaps(over, ['secret'])).toBe(over)
  })
})

describe.each(['concept', 'sound'] as const)('his tablet once the teller continues (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
    writeAnswers(initialAnswers)
  })

  const buttons = (node: ReactNode) => [...html(node).matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => text(m[1]))
  const offers = (node: ReactNode) => {
    const labels = buttons(node).join(' | ')
    return { taps: JAMES_TAPS.some((t) => labels.includes(t.label)), next: /\bContinue\b/.test(labels) }
  }

  it('offers the taps and Continue until then', () => {
    changeAnswers((a) => answerActions.teller(a, 'ask'))
    expect(offers(teller.member)).toEqual({ taps: true, next: true })
    expect(text(teller.member)).not.toContain(GOING_AHEAD)
  })

  it('stops offering taps and Continue, says it goes ahead at his decision, and keeps his taps as they were', () => {
    changeAnswers((a) => answerActions.tap(a, 'secret'))
    changeAnswers((a) => answerActions.teller(a, 'continue'))
    const page = text(teller.member)
    expect(offers(teller.member)).toEqual({ taps: false, next: false })
    expect(page).toContain('Withdrawal going ahead')
    expect(page).toContain(GOING_AHEAD)
    expect(page).toContain(CALL_AGENCY)
    expect(page).not.toContain('Is any of this happening today?')
    const before = readAnswers()
    changeAnswers((a) => answerActions.tap(a, 'move'))
    expect(readAnswers()).toBe(before)
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

const pressed = (node: ReactNode) => html(node).match(/aria-pressed="true"/g)?.length ?? 0

describe('two windows, as on two laptops', () => {
  it('keep his taps on his tablet, and show the teller choice in both', async () => {
    const member = await openWindow()
    const staff = await openWindow()
    member.store.changeAnswers((a) => answerActions.tap(a, 'investigation'))
    member.store.changeAnswers((a) => answerActions.tap(a, 'secret'))
    expect(pressed(member.steps[1].member)).toBe(2)
    expect(text(member.steps[1].member)).toContain(SCAM_NAMED)
    relay(member, staff)
    expect(staff.store.readAnswers().taps).toEqual([])
    expect(pressed(staff.steps[1].member)).toBe(0)

    staff.store.changeAnswers((a) => answerActions.teller(a, 'continue'))
    relay(staff, member)
    expect(member.store.readAnswers()).toEqual({ ...staff.store.readAnswers(), taps: ['investigation', 'secret'] })
    expect(text(member.steps[1].staff)).toContain('Withdrawal continued')
    expect(text(member.steps[2].member)).toContain('The $7,000 was handed over.')
    expect(text(staff.steps[2].staff)).toContain('Cash handed over')
  })

  it('tell the teller he asked to talk privately, and take it back when he untaps it', async () => {
    const member = await openWindow()
    const staff = await openWindow()
    const asked = 'James asked to talk privately. Find a private desk, away from anyone with him.'
    expect(text(staff.steps[1].staff)).not.toContain(asked)
    member.store.changeAnswers((a) => answerActions.tap(a, 'secret'))
    member.store.changeAnswers((a) => answerActions.tap(a, 'private'))
    relay(member, staff)
    expect(staff.store.readAnswers().taps).toEqual(['private'])
    expect(text(staff.steps[1].staff)).toContain(asked)
    expect(text(staff.steps[1].staff)).not.toContain(JAMES_TAPS.find((t) => t.id === 'secret')!.label)

    staff.store.changeAnswers((a) => answerActions.teller(a, 'ask'))
    relay(staff, member)
    expect(member.store.readAnswers().taps).toEqual(['secret', 'private'])
    member.store.changeAnswers((a) => answerActions.tap(a, 'private'))
    relay(member, staff)
    expect(staff.store.readAnswers().taps).toEqual([])
    expect(text(staff.steps[1].staff)).not.toContain(asked)
    expect(member.store.readAnswers().taps).toEqual(['secret'])
  })

  it('keep the newer copy when a stale one arrives', () => {
    writeAnswers(initialAnswers)
    changeAnswers((a) => answerActions.teller(a, 'continue'))
    const newer = readAnswers()
    receiveAnswers({ ...initialAnswers, v: newer.v - 1, teller: ['escalate'] })
    expect(readAnswers()).toEqual(newer)
  })

  it('send only a private-talk request, and keep his other taps when a newer copy arrives until a newer run', () => {
    expect(outbound({ ...initialAnswers, agent: 'transfer', taps: ['secret', 'private'] })).toEqual({
      ...initialAnswers,
      agent: 'transfer',
      taps: ['private'],
    })
    expect(outbound({ ...initialAnswers, taps: ['none'] }).taps).toEqual([])
    writeAnswers(initialAnswers)
    changeAnswers((a) => answerActions.tap(a, 'move'))
    receiveAnswers({ ...initialAnswers, v: 5, teller: ['ask'] })
    expect(readAnswers()).toEqual({ ...initialAnswers, v: 5, teller: ['ask'], taps: ['move'] })
    receiveAnswers({ ...initialAnswers, v: 6, teller: ['ask'], taps: ['private'] })
    expect(readAnswers().taps).toEqual(['move', 'private'])
    receiveAnswers({ ...initialAnswers, v: 7, teller: ['ask'] })
    expect(readAnswers().taps).toEqual(['move'])
    receiveAnswers({ ...initialAnswers, run: 1, v: 8 })
    expect(readAnswers()).toEqual({ ...initialAnswers, run: 1, v: 8 })
  })

  it('start empty on a new run, and an earlier run never comes back', () => {
    writeAnswers({ ...initialAnswers, run: 2, v: 9, agent: 'transfer', taps: ['secret'], teller: ['continue'] })
    startRun(3)
    expect(readAnswers()).toEqual({ ...initialAnswers, run: 3 })
    receiveAnswers({ ...initialAnswers, run: 2, v: 20, teller: ['continue'] })
    expect(readAnswers().teller).toEqual([])
    startRun(2)
    expect(readAnswers().run).toBe(3)
  })

  it('start empty when the story is back on step one', () => {
    writeAnswers({ ...initialAnswers, run: 1, v: 4, agent: 'hesitated', taps: ['move'], teller: ['ask', 'continue'] })
    changeAnswers(answerActions.reset)
    expect(readAnswers()).toEqual({ ...initialAnswers, run: 1, v: 5 })
  })
})
