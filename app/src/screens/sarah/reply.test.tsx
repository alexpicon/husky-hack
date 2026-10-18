/**
 * Sarah's reply to "Was this you?": answers are final, windows agree on one copy, and every
 * device in every step after the question tells the same story, under both answers to D1.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POLICY } from '../../data/policy'
import { BothStage } from '../../shell/Stages'
import { sarah as story } from '../../story/sarah'
import { initialReply, caseStage, inRun, mergeReplies, released, replyActions, type SarahReply } from './reply'
import { writeReply } from './replyState'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look and window sync need a browser; these tests pick the look and keep one window.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const defaults = { ...POLICY }
afterEach(() => {
  Object.assign(POLICY, defaults)
  writeReply(initialReply)
})

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')

const reply = (answer: SarahReply['answer'], callback = false): SarahReply => ({ v: 1, run: 0, answer, callback })

/** The scammer's, Sarah's and staff's screens at one step, in that order, plus the raw markup. */
function devices(id: 'ask' | 'not-me' | 'secured') {
  const step = story.steps.find((s) => s.id === id)!
  const html = renderToStaticMarkup(<BothStage id={id} step={step} zones={story.zones!} />)
  const [scammer, phone, staff] = html
    .split(/(?=<section aria-label="[^"]*" data-zone=")/)
    .slice(1)
    .map(textOf)
  return { scammer, phone, staff, html }
}

describe('the reply itself', () => {
  it('keeps her first answer: a second tap changes nothing', () => {
    const yes = replyActions.answer(initialReply, 'yes')
    expect(yes.answer).toBe('yes')
    expect(replyActions.answer(yes, 'no')).toBe(yes)
    const no = replyActions.answer(initialReply, 'no')
    expect(replyActions.answer(no, 'yes')).toBe(no)
  })

  it('takes a callback only after a YES', () => {
    expect(replyActions.callbackDone(initialReply)).toBe(initialReply)
    expect(replyActions.callbackDone(reply('no'))).toEqual(reply('no'))
    expect(replyActions.callbackDone(reply('yes')).callback).toBe(true)
  })

  it('starts empty on the first step and in a new demo run, keeping the edit count', () => {
    const answered = { ...reply('yes', true), v: 7, run: 2 }
    expect(replyActions.reset(answered)).toEqual({ ...initialReply, v: 7, run: 2 })
    expect(inRun(answered, 2)).toBe(answered)
    expect(inRun(answered, 3)).toEqual({ ...initialReply, v: 7, run: 3 })
  })

  it('lets two windows settle on the same copy, whichever merges first', () => {
    const tapped = { ...reply('yes'), v: 4 }
    const stale = { ...reply(null), v: 3 }
    expect(mergeReplies(tapped, stale)).toBe(tapped)
    expect(mergeReplies(stale, tapped)).toBe(tapped)
    const otherTap = { ...reply('no'), v: 4 }
    expect(mergeReplies(tapped, otherTap)).toBe(mergeReplies(otherTap, tapped))
    const newRun = { ...reply('no'), v: 1, run: 5 }
    expect(mergeReplies(tapped, newRun)).toBe(newRun)
    expect(mergeReplies(newRun, tapped)).toBe(newRun)
  })

  it('releases on a YES alone only when the policy is "yes", and never on a NO', () => {
    POLICY.fullStopRelease = 'yes'
    expect(released(reply('yes'))).toBe(true)
    expect(released(reply('no'))).toBe(false)
    POLICY.fullStopRelease = 'callback'
    expect(released(reply('yes'))).toBe(false)
    expect(released(reply('yes', true))).toBe(true)
    expect(released(reply(null))).toBe(false)
  })

  it('maps each step and reply to the staff stage', () => {
    POLICY.fullStopRelease = 'callback'
    expect(caseStage('asked', reply(null))).toBe('asked')
    expect(caseStage('asked', reply('no'))).toBe('not-me')
    expect(caseStage('asked', reply('yes'))).toBe('its-me')
    expect(caseStage('not-me', reply('yes'))).toBe('not-me')
    expect(caseStage('secured', reply('yes'))).toBe('secured')
    for (const step of ['asked', 'not-me', 'secured'] as const) {
      expect(caseStage(step, reply('yes', true))).toBe('released')
    }
  })
})

describe.each(['concept', 'sound'] as const)('every device after her answer (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
  })

  /** Nothing anywhere says the money went while it is held, or that it is held once it went. */
  function agree(id: 'ask' | 'not-me' | 'secured', sent: boolean) {
    const { scammer, phone, staff } = devices(id)
    const all = `${scammer} ${phone} ${staff}`
    if (sent) {
      expect(scammer).toContain('Payment sent')
      for (const held of ['pending review', 'We stopped', 'Waiting for member', 'Stopped before send']) {
        expect(all).not.toContain(held)
      }
    } else {
      expect(all).not.toContain('Payment sent')
      expect(all).not.toMatch(/released the payment|Released to recipient/)
    }
    return { scammer, phone, staff }
  }

  it('No: locks both buttons on her answer and follows the scripted path', () => {
    POLICY.fullStopRelease = 'callback'
    writeReply(reply('no'))
    const ask = devices('ask')
    expect(ask.html.match(/<button type="button" disabled=""[^>]*aria-pressed="(true|false)"/g)).toHaveLength(2)
    expect(ask.html.match(/aria-pressed="true"[^>]*>(?:<svg.*?<\/svg>)?No, it wasn&#x27;t me/)).not.toBeNull()
    const asked = agree('ask', false)
    expect(asked.phone).toContain("No, it wasn't me")
    expect(asked.staff).toContain('Member said NO')
    expect(asked.scammer).toContain('pending review')
    const notMe = agree('not-me', false)
    expect(notMe.phone).toContain("Thank you. We're keeping the payment stopped.")
    expect(notMe.staff).toContain('Replied NO')
    const secured = agree('secured', false)
    expect(secured.phone).toContain('We stopped the payment and locked online access')
    expect(secured.scammer).toContain('Signed out: account locked')
  })

  it('Yes, under "callback": holds the payment for the specialist, then the callback hears it was not her', () => {
    POLICY.fullStopRelease = 'callback'
    writeReply(reply('yes'))
    const asked = agree('ask', false)
    expect(asked.phone).toContain(
      'Thanks. A specialist will call you at this number before anything is sent. If someone told you to tap Yes, call the number on your card.',
    )
    expect(asked.staff).toContain(
      'Member said YES on the number on file before the change: specialist callback required before release',
    )
    expect(asked.staff).toContain('Callback done: confirmed')
    expect(asked.staff).not.toContain('Waiting for member')
    expect(asked.scammer).toContain('Still waiting: payment pending review')
    const notMe = agree('not-me', false)
    expect(notMe.phone).toContain('Yes, it was me')
    expect(notMe.phone).toContain("You told our specialist it wasn't you.")
    expect(notMe.phone).not.toContain('Received')
    expect(notMe.staff).toContain('Callback: NO')
    expect(notMe.staff).toContain('then told the specialist "No, this wasn\'t me."')
    const secured = agree('secured', false)
    expect(secured.phone).toContain('We stopped the payment and locked online access')
    expect(secured.staff).toContain('Callback: NO')
    expect(secured.scammer).toContain('Signed out: account locked')
    for (const later of [notMe, secured]) {
      expect(later.staff).not.toContain('Needs a callback')
      expect(later.staff).toContain('Callback done: the member said NO')
    }
  })

  it('Yes and a confirmed callback, under "callback": released on every device, and later steps say so', () => {
    POLICY.fullStopRelease = 'callback'
    writeReply(reply('yes', true))
    const asked = agree('ask', true)
    expect(asked.phone).toContain("Thanks for confirming with our specialist. We've released the payment.")
    expect(asked.staff).toContain('Callback: confirmed')
    expect(asked.staff).toContain('Released after a specialist called the number on file before the change.')
    for (const id of ['not-me', 'secured'] as const) {
      const later = agree(id, true)
      expect(later.phone).toContain('This run took the Yes path.')
      expect(later.staff).toContain('This run took the Yes path.')
      expect(later.phone).not.toContain("No, it wasn't me")
    }
  })

  it('Yes, under "yes": released at once on every device, and later steps say so', () => {
    POLICY.fullStopRelease = 'yes'
    writeReply(reply('yes'))
    const asked = agree('ask', true)
    expect(asked.phone).toContain("Thanks. We've released the payment for processing.")
    expect(asked.staff).toContain('Released after one tap.')
    expect(asked.staff).not.toContain('Callback done: confirmed')
    for (const id of ['not-me', 'secured'] as const) {
      expect(agree(id, true).phone).toContain('a Yes on the number on file released the payment')
    }
  })

  it('no answer yet: the question waits, and Next shows the scripted No', () => {
    POLICY.fullStopRelease = 'callback'
    const asked = agree('ask', false)
    expect(asked.staff).toContain('Waiting for member')
    expect(devices('ask').html).not.toContain('aria-pressed="true"')
    expect(agree('not-me', false).phone).toContain("No, it wasn't me")
  })
})
