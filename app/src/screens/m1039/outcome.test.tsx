/** M1039's answer is shared and final, and the last step, its script and the staff case all follow it. */
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { m1039 } from '../../story/m1039'
import { answerActions, initialAnswer, mergeAnswers, writeAnswer, type AnswerState, type M1039Answer } from './answerState'
import { CheckScreen } from './CheckScreen'
import { staffStage } from './outcomes'
import { TapScreen } from './TapScreen'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The look switch and the answer sync across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))
vi.mock('../../shell/sync', () => ({ useWindowSync: () => {} }))

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }
const textOf = (node: ReactNode) =>
  renderToStaticMarkup(<>{node}</>)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')
    .trim()

const buttons = (node: ReactNode) =>
  [...renderToStaticMarkup(<>{node}</>).matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").trim(),
  )

const answered = (answer: M1039Answer | null, locked = false) =>
  writeAnswer({ ...initialAnswer, v: 1, answer, locked })

const [, , tap, last] = m1039.steps

beforeEach(() => answered(null))

describe('the shared answer', () => {
  it('keeps the first answer: a later tap changes nothing', () => {
    const no = answerActions.give(initialAnswer, 'no')
    expect(no.answer).toBe('no')
    expect(answerActions.give(no, 'yes')).toBe(no)
  })

  it('locks the case only after a No', () => {
    expect(answerActions.lock(answerActions.give(initialAnswer, 'no')).locked).toBe(true)
    const notSure = answerActions.give(initialAnswer, 'not-sure')
    expect(answerActions.lock(notSure)).toBe(notSure)
  })

  it('clears an answer for a new run, and leaves a blank one alone', () => {
    const no: AnswerState = { run: 1, v: 4, answer: 'no', locked: true }
    expect(answerActions.reset(no, 2)).toEqual({ run: 2, v: 4, answer: null, locked: false })
    const blank = { ...initialAnswer, run: 2 }
    expect(answerActions.reset(blank, 2)).toBe(blank)
  })

  it('settles two windows on the newer run first, then the one with more edits', () => {
    const rehearsal: AnswerState = { run: 1, v: 9, answer: 'no', locked: false }
    const live: AnswerState = { run: 2, v: 1, answer: null, locked: false }
    expect(mergeAnswers(rehearsal, live)).toBe(live)
    expect(mergeAnswers(live, rehearsal)).toBe(live)
    const later = { ...live, v: 2, answer: 'yes' as const }
    expect(mergeAnswers(live, later)).toBe(later)
  })
})

describe('the staff case follows the answer', () => {
  it.each([
    [null, false, 'released'],
    ['yes', false, 'released'],
    ['no', false, 'not-me'],
    ['no', true, 'secured'],
    ['not-sure', false, 'asked'],
    ['lost-phone', false, 'asked'],
  ] as const)('%s (locked: %s) shows %s on the last step', (answer, locked, stage) => {
    expect(staffStage(answer, locked, 'released')).toBe(stage)
  })

  it('waits for the member on the text step until they answer', () => {
    expect(staffStage(null, false, 'asked')).toBe('asked')
    expect(staffStage('no', false, 'asked')).toBe('not-me')
  })
})

const paths = [
  {
    answer: 'yes',
    title: 'One tap. Yes releases the rent.',
    phone: ['Your payment was sent for processing', 'Released today'],
    staff: 'Released after one tap.',
  },
  {
    answer: 'no',
    title: 'They tapped No. Nothing was sent.',
    phone: [
      'Payment stopped',
      'Payments to new recipients are held, and a Sound specialist will check your account and call you.',
      'Stopped, not sent',
    ],
    staff: 'Member said NO',
  },
  {
    answer: 'not-sure',
    title: 'Not sure? It stays paused.',
    phone: ['Still paused', 'Sound will call you at the number on file. Nothing is sent until you confirm.'],
    staff: 'Waiting for member',
  },
  {
    answer: 'lost-phone',
    title: 'A lost phone releases nothing.',
    phone: [
      "We won't send it yet",
      'Call the number on your card or visit any Sound branch with your ID. Nothing is sent meanwhile.',
    ],
    staff: 'Waiting for member',
  },
] as const

const RELEASED = /released|sent for processing/i

describe.each(['concept', 'sound'] as const)('the last step after each answer (%s look)', (variant) => {
  beforeEach(() => {
    look.current = variant
  })

  it.each(paths)('after $answer, the phone, the staff case and the script agree', (path) => {
    answered(path.answer)
    const phone = textOf(last.member)
    const staff = textOf(last.staff)
    for (const line of path.phone) expect(phone).toContain(line)
    expect(staff).toContain(path.staff)
    expect(last.title).toBe(path.title)
    if (path.answer === 'yes') return
    for (const text of [phone, last.title, last.caption]) expect(text).not.toMatch(RELEASED)
    expect(staff).not.toContain('Released after one tap.')
  })

  it('tells the scripted Yes when nobody answered on the text, in words true for any answer', () => {
    expect(last.title).toBe(paths[0].title)
    expect(last.caption).toContain('With Second Look a Yes releases it when they tap, and any other answer sends nothing.')
    expect(textOf(last.member)).toContain('Your payment was sent for processing')
    expect(textOf(last.staff)).toContain('Released after one tap.')
  })

  it('shows the case stopped and locked once staff lock it after a No', () => {
    answered('no', true)
    expect(textOf(last.staff)).toContain('Stopped before send.')
  })
})

describe('the answer is final on every screen that asks for it', () => {
  it.each(['yes', 'no', 'not-sure'] as const)('the text keeps the %s reply and drops its buttons', (answer) => {
    answered(answer)
    expect(buttons(<TapScreen />)).toEqual([])
  })

  it('closes the text after "I lost that phone", and the script says why', () => {
    answered('lost-phone')
    const text = textOf(<TapScreen />)
    expect(buttons(<TapScreen />)).toEqual([])
    expect(text).toContain("This request is closed, and nothing will be sent. You don't need to reply.")
    expect(text).not.toContain('No answer within')
    expect(tap.caption).toContain('they lost that phone')
  })

  it('shows the staff the NO on the text step at once', () => {
    answered('no')
    expect(textOf(tap.staff)).toContain('Member said NO')
  })

  it.each(['concept', 'sound'] as const)('keeps "I lost that phone" in the app after it is tapped (%s look)', (variant) => {
    look.current = variant
    answered('lost-phone')
    expect(textOf(<CheckScreen />)).toContain("We won't send it yet")
    expect(buttons(<CheckScreen />)).toEqual([])
    answered('no')
    expect(buttons(<CheckScreen />)).toEqual(['Check your messages'])
  })
})
