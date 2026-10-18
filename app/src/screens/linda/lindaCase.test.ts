/** Linda's shared case: final outcomes, resets, and windows that agree after any exchange. */
import { describe, expect, it } from 'vitest'
import { caseActions as act, initialCase, mergeCases, type LindaCase } from './lindaCase'

const at = new Date(2026, 9, 20, 14, 16)
const edit = (c: LindaCase, change: (c: LindaCase) => LindaCase) => {
  const next = change(c)
  return next === c ? c : { ...next, v: c.v + 1 }
}

describe('the case', () => {
  it('starts private, with no taps and no outcome', () => {
    expect(initialCase).toMatchObject({ taps: [], shared: false, outcome: null, staffActions: [] })
  })

  it('keeps taps in list order whatever order she taps them', () => {
    const c = act.tap(act.tap(initialCase, 'bail'), 'family')
    expect(c.taps).toEqual(['family', 'bail'])
    expect(act.tap(c, 'bail').taps).toEqual(['family'])
  })

  it('records a skip only when she continues without tapping', () => {
    expect(act.finishCheck(initialCase).skipped).toBe(true)
    expect(act.finishCheck(act.tap(initialCase, 'secret')).skipped).toBe(false)
  })

  it('never changes an outcome once it is set', () => {
    const cancelled = act.decide(initialCase, 'cancelled', at)
    expect(act.decide(cancelled, 'sent', at, 'She confirmed')).toBe(cancelled)
    expect(act.askToSend(cancelled)).toBe(cancelled)
    expect(act.staff(cancelled, 'holding')).toBe(cancelled)
    expect(act.staff(cancelled, 'case-opened').staffActions).toEqual(['case-opened'])
  })

  it('starts a fresh round on reset', () => {
    const done = act.decide(act.tap(initialCase, 'family'), 'sent', at, 'She confirmed')
    expect(act.reset(done)).toEqual({ ...initialCase, round: 1 })
  })
})

describe('two windows', () => {
  const tapped = edit(initialCase, (c) => act.tap(c, 'family'))
  const shared = edit(tapped, (c) => act.share(c, true))

  it('agree whichever side merges', () => {
    const member = edit(shared, (c) => act.decide(c, 'cancelled', at))
    const escalated = edit(tapped, (c) => act.staff(c, 'escalated'))
    const staff = edit(escalated, (c) => act.staff(c, 'holding'))
    expect(mergeCases(member, staff)).toEqual(mergeCases(staff, member))
  })

  it('keep the safer ending when both finish at once', () => {
    const cancel = edit(shared, (c) => act.decide(c, 'cancelled', at))
    const release = edit(shared, (c) => act.decide(c, 'sent', at, 'She confirmed'))
    expect(mergeCases(cancel, release).outcome?.kind).toBe('cancelled')
    expect(mergeCases(release, cancel).outcome?.kind).toBe('cancelled')
  })

  it('never lose an outcome to a stale copy', () => {
    const cancel = edit(shared, (c) => act.decide(c, 'cancelled', at))
    const escalated = edit(tapped, (c) => act.staff(c, 'escalated'))
    const stale = edit(edit(escalated, (c) => act.share(c, false)), (c) => act.staff(c, 'case-opened'))
    expect(stale.v).toBeGreaterThan(cancel.v)
    expect(mergeCases(cancel, stale).outcome?.kind).toBe('cancelled')
  })

  it('let a reset replace the old case, and ignore an old round', () => {
    const done = edit(shared, (c) => act.decide(c, 'sent', at, 'She confirmed'))
    const fresh = act.reset(done)
    expect(mergeCases(done, fresh)).toBe(fresh)
    expect(mergeCases(fresh, done)).toBe(fresh)
  })
})
