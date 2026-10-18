/** M1039's payment is "sent for processing", never promised to arrive, in both looks. */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { money } from '../../ui/format'
import { TakeoverCase } from '../staff/TakeoverCase'
import { facts } from './facts'
import { HonestCard } from './HonestCard'
import { PayScreen } from './PayScreen'
import { ReleasedScreen } from './ReleasedScreen'
import { TapScreen } from './TapScreen'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look switch syncs across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')

const NO_PROMISE = /arrives|on its way|same day/i

describe.each(['concept', 'sound'] as const)('M1039 member screens (%s look)', (variant) => {
  look.current = variant
  const released = textOf(renderToStaticMarkup(<ReleasedScreen />))
  const pay = textOf(renderToStaticMarkup(<PayScreen />))
  const tap = textOf(renderToStaticMarkup(<TapScreen />))

  it('says the released payment was sent for processing', () => {
    expect(released).toContain('Your payment was sent for processing')
    expect(released).toContain('Released today')
    expect(released).toMatch(/Status Sent for processing/)
    expect(released).not.toMatch(NO_PROMISE)
  })

  it('shows the send date before sending, not an arrival', () => {
    expect(pay).toMatch(/Send date Today/)
    expect(pay).not.toMatch(NO_PROMISE)
  })

  it('asks for a Yes that releases it for processing, and warns about coaching', () => {
    expect(tap).toContain(
      "Tap Yes and we'll release it for processing. If a website or caller told you to expect this text, tap No. We'll never ask for your password or a code.",
    )
  })
})

describe('around the stage', () => {
  it('releases the payment when they tap, on the staff outcome and the honest-cost card', () => {
    const staff = textOf(renderToStaticMarkup(<TakeoverCase member="M1039" stage="released" />))
    expect(staff).toContain(
      `The ${facts.payment.rail} payment of ${money(facts.payment.amount)} is released for processing when they tap.`,
    )
    const card = textOf(renderToStaticMarkup(<HonestCard />))
    expect(card).toContain('Released when they tap.')
    for (const text of [staff, card]) expect(text).not.toMatch(/same day|member key/i)
  })
})
