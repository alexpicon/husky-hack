/** What leaves Linda's window: only what she shares; her unshared answers stay where she gave them. */
import { describe, expect, it } from 'vitest'
import { caseActions as act, initialCase, outbound, receiveCase, type LindaCase } from './lindaCase'

/** One edit, as the provider makes it: it counts toward which copy wins, and a reset starts a round. */
const edit = (c: LindaCase, change: (c: LindaCase) => LindaCase) => {
  const next = change(c)
  return next === c || next.round !== c.round ? next : { ...next, v: c.v + 1 }
}

/** What another window holds once this window's copy reaches it. */
const send = (from: LindaCase, to: LindaCase) => receiveCase(to, outbound(from))

const tapped = edit(edit(initialCase, (c) => act.tap(c, 'family')), (c) => act.tap(c, 'bail'))
const shared = edit(tapped, (c) => act.share(c, true))

describe('the copy that leaves her window', () => {
  it('carries no taps until she shares', () => {
    expect(outbound(tapped)).toEqual({ ...tapped, taps: [] })
    expect(JSON.stringify(outbound(tapped))).not.toMatch(/family|bail/)
  })

  it('looks the same whether she skipped or answered privately', () => {
    const skipped = edit(initialCase, act.finishCheck)
    const answered = edit(edit(initialCase, (c) => act.tap(c, 'none')), act.finishCheck)
    expect(skipped.skipped).toBe(true)
    expect({ ...outbound(skipped), v: 0 }).toEqual({ ...outbound(answered), v: 0 })
  })

  it('always carries her request to talk privately, which staff always see', () => {
    expect(outbound(edit(tapped, (c) => act.tap(c, 'private'))).taps).toEqual(['private'])
  })

  it('carries everything once she shares', () => {
    expect(outbound(shared)).toBe(shared)
  })
})

describe('her tablet and the wire desk', () => {
  it('show the desk nothing she has not shared', () => {
    const desk = send(edit(tapped, act.finishCheck), initialCase)
    expect(desk).toMatchObject({ shared: false, taps: [], skipped: false })
  })

  it('update the desk the moment she shares', () => {
    expect(send(shared, send(tapped, initialCase))).toMatchObject({ shared: true, taps: ['family', 'bail'] })
  })

  it('keep her unshared answers when a newer staff action arrives', () => {
    const desk = edit(send(tapped, initialCase), (c) => act.staff(c, 'escalated'))
    expect(desk.v).toBeGreaterThan(tapped.v)
    expect(send(desk, tapped)).toEqual({ ...tapped, v: desk.v, staffActions: ['escalated'] })
  })

  it('keep her request to talk privately in step, beside her unshared answers', () => {
    const asked = edit(tapped, (c) => act.tap(c, 'private'))
    const desk = edit(send(asked, initialCase), (c) => act.staff(c, 'holding'))
    expect(desk.taps).toEqual(['private'])
    expect(send(desk, asked).taps).toEqual(['family', 'bail', 'private'])
  })

  it('take the shared taps back from the desk when she stops sharing', () => {
    const desk = send(shared, initialCase)
    expect(desk.taps).toEqual(['family', 'bail'])
    const unshared = edit(shared, (c) => act.share(c, false))
    expect(unshared.taps).toEqual(['family', 'bail'])
    expect(send(unshared, desk)).toMatchObject({ shared: false, taps: [] })
  })

  it('settle on the same shared case whichever window merges first', () => {
    const tablet = edit(tapped, act.askToSend)
    const desk = edit(edit(initialCase, (c) => act.staff(c, 'holding')), (c) => act.staff(c, 'escalated'))
    expect(outbound(send(tablet, desk))).toEqual(outbound(send(desk, tablet)))
  })

  it('clear her unshared answers on a reset and a new run, in every window', () => {
    const reset = edit(tapped, act.reset)
    expect(reset.taps).toEqual([])
    expect(send(reset, tapped)).toEqual(reset)
    const run = edit(tapped, (c) => act.startRun(c, 5))
    expect(send(run, tapped)).toEqual(run)
  })
})
