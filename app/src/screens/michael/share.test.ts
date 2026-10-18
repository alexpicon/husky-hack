/** What leaves Michael's window: only what he shares; his unshared answers stay where he gave them. */
import { describe, expect, it } from 'vitest'
import { checkActions as act, initialCheck, outbound, receiveCheck, staffView, type MichaelCheck } from './check'

/** One edit, as the store makes it: it counts toward which copy wins. */
const edit = (c: MichaelCheck, change: (c: MichaelCheck) => MichaelCheck) => {
  const next = change(c)
  return next === c ? c : { ...next, v: c.v + 1 }
}

/** What another window holds once this window's copy reaches it. */
const send = (from: MichaelCheck, to: MichaelCheck) => receiveCheck(to, outbound(from))

const tapped = edit(edit(initialCheck, (c) => act.tap(c, 'never-met')), (c) => act.tap(c, 'investment'))
const answered = edit(tapped, (c) => act.test(c, 'failed'))
const shared = edit(answered, (c) => act.share(c, true))

describe('the copy that leaves his window', () => {
  it('carries no taps and no withdrawal-test answer until he shares', () => {
    expect(outbound(answered)).toEqual({ ...answered, taps: [], test: null })
    expect(JSON.stringify(outbound(answered))).not.toMatch(/never-met|investment|failed/)
  })

  it('keeps "None of these" private too', () => {
    expect(outbound(edit(initialCheck, (c) => act.tap(c, 'none'))).taps).toEqual([])
  })

  it('always carries his own account, which staff always see', () => {
    expect(outbound(edit(initialCheck, (c) => act.tap(c, 'own'))).taps).toEqual(['own'])
  })

  it('carries everything once he shares', () => {
    expect(outbound(shared)).toBe(shared)
  })
})

describe('his phone and a staff laptop', () => {
  it('show staff nothing he has not shared', () => {
    const staff = send(answered, initialCheck)
    expect(staff).toEqual({ ...answered, taps: [], test: null })
    expect(staffView(staff)).toEqual({ taps: [], ownAccount: false, test: null })
  })

  it('update staff the moment he shares', () => {
    const staff = send(shared, send(answered, initialCheck))
    expect(staffView(staff)).toEqual({ taps: ['never-met', 'investment'], ownAccount: false, test: 'failed' })
  })

  it('keep his unshared answers when a newer copy arrives from another window', () => {
    const staff = edit(send(answered, initialCheck), (c) => act.wire(c, 'wait'))
    expect(staff.v).toBeGreaterThan(answered.v)
    expect(send(staff, answered)).toEqual({ ...answered, v: staff.v, wire: 'wait' })
  })

  it('take the shared answers back from every other window when he stops sharing', () => {
    const staff = send(shared, initialCheck)
    expect(staff.taps).toEqual(['never-met', 'investment'])
    const unshared = edit(shared, (c) => act.share(c, false))
    expect(unshared).toMatchObject({ taps: ['never-met', 'investment'], test: 'failed' })
    expect(send(unshared, staff)).toMatchObject({ shared: false, taps: [], test: null })
  })

  it('keep the newer window as it is when a stale copy arrives, so it sends its own back', () => {
    expect(receiveCheck(answered, outbound(initialCheck))).toBe(answered)
  })

  it('settle on the same shared check whichever window merges first', () => {
    const phone = edit(answered, (c) => act.card(c, 'not-now'))
    const other = edit(edit(initialCheck, (c) => act.tap(c, 'secret')), (c) => act.tap(c, 'emergency'))
    expect(outbound(send(phone, other))).toEqual(outbound(send(other, phone)))
    expect(send(phone, other).taps).toEqual(['secret', 'emergency'])
  })

  it('show his own account everywhere', () => {
    const own = edit(answered, (c) => act.tap(c, 'own'))
    expect(staffView(send(own, initialCheck)).ownAccount).toBe(true)
  })

  it('clear his unshared answers on a reset, a new run, and a newer run from another window', () => {
    expect(act.reset(answered)).toEqual({ ...initialCheck, v: answered.v })
    expect(act.forRun(answered, 1)).toEqual({ ...initialCheck, run: 1, v: answered.v })
    const newRun = act.forRun(initialCheck, 2)
    expect(send(newRun, answered)).toEqual(newRun)
  })
})
