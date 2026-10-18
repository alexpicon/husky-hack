/**
 * What whoever is signed in can learn from a paused payment (Sarah's full stop, M1039's light
 * check), and what only the real member and staff see.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { clock, money } from '../../ui/format'
import { CheckScreen } from '../m1039/CheckScreen'
import { facts as m1039 } from '../m1039/facts'
import { TakeoverCase } from '../staff/TakeoverCase'
import { Ask } from './Ask'
import { sarah } from './facts'
import { Paused } from './Paused'
import { SendMoney } from './SendMoney'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look switch syncs across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))

const STATUS_BAR_CLOCK = /<span class="num">[^<]*<\/span>/g

const entities: Record<string, string> = { '&#x27;': "'", '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' }

/** The words a reader sees: tags dropped, entities decoded, whitespace collapsed. */
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&quot;|&amp;|&lt;|&gt;/g, (m) => entities[m])
    .replace(/\s+/g, ' ')

describe.each(['concept', 'sound'] as const)("the attacker's paused screen (%s look)", (variant) => {
  look.current = variant
  const raw = renderToStaticMarkup(<Paused />)
  const html = raw.replace(STATUS_BAR_CLOCK, '')
  const text = textOf(html)

  it('renders the variant for its look, with one status-bar clock', () => {
    expect(html.includes('Pay Anyone')).toBe(variant === 'sound')
    expect(raw.match(STATUS_BAR_CLOCK)).toHaveLength(1)
  })

  it('shows only the neutral review message and the amount', () => {
    expect(text).toContain('This payment is being reviewed.')
    expect(text).toContain("We'll let you know when it's done.")
    expect(text).toContain(`Payment ${money(sarah.paused.amount)} Status Pending review`)
    expect(money(sarah.paused.amount)).toBe('$1,574.18')
  })

  it('carries no time, event ID or signal', () => {
    expect(html).not.toMatch(/\d{1,2}:\d{2}/)
    expect(html).not.toMatch(/E\d{5}/)
    for (const word of ['reset', 'email', 'phone', 'recipient added']) {
      expect(html.toLowerCase()).not.toContain(word)
    }
  })

  it('does not say who else is being asked', () => {
    expect(text).not.toMatch(/contact details/i)
  })
})

describe.each(['concept', 'sound'] as const)("the captions under the scammer's phone (%s look)", (variant) => {
  look.current = variant
  const send = textOf(renderToStaticMarkup(<SendMoney />))
  const paused = textOf(renderToStaticMarkup(<Paused />))

  it("leaves whose phone it is to the zone label, and keeps the pause's caption", () => {
    expect(send).not.toContain("Sarah's account, but it's the scammer holding the phone")
    expect(paused).toContain('There is no button to get around the pause')
  })

  it('says P2P payments usually cannot be pulled back, as the kit shows (6 of 8 recalls failed)', () => {
    expect(send).toContain("P2P payments usually can't be pulled back once they're sent.")
  })
})

describe.each(['concept', 'sound'] as const)("the scammer's send screen (%s look)", (variant) => {
  look.current = variant
  const raw = renderToStaticMarkup(<SendMoney />)
  const html = raw.replace(STATUS_BAR_CLOCK, '')

  it('renders the variant for its look, with one status-bar clock', () => {
    expect(html.includes('Pay Anyone')).toBe(variant === 'sound')
    expect(raw.match(STATUS_BAR_CLOCK)).toHaveLength(1)
  })

  it('says the recipient is new without a clock time', () => {
    expect(textOf(html)).toContain('Added tonight')
    expect(html).not.toMatch(/\d{1,2}:\d{2}/)
  })

  it('carries no kit event ID', () => {
    expect(html).not.toMatch(/E\d{5}/)
  })
})

describe.each(['concept', 'sound'] as const)("M1039's in-app check (%s look)", (variant) => {
  look.current = variant
  const html = renderToStaticMarkup(<CheckScreen />)
  const text = textOf(html)

  it('renders the variant for its look', () => {
    expect(html.includes('Bill Pay')).toBe(variant === 'sound')
  })

  it('asks for a quick yes and points to the messages, with the derived amount', () => {
    expect(text).toContain(
      `This payment needs a quick yes before ${money(m1039.payment.amount)} goes. If you started it, check your messages from Sound.`,
    )
    expect(money(m1039.payment.amount)).toBe('$4,151.68')
  })

  it('carries no time, event ID or light-check signal', () => {
    expect(html).not.toMatch(/\d{1,2}:\d{2}/)
    expect(html).not.toMatch(/E\d{5}/)
    for (const word of ['password', 'reset', 'address', 'recipient', 'email', 'yesterday', 'today']) {
      expect(text.toLowerCase()).not.toContain(word)
    }
    expect(text).not.toMatch(/\bnew\b/i)
  })

  it('does not say who else is being asked or that their contact is unchanged', () => {
    for (const phrase of ['texted', 'changed', 'all along', 'contact details']) {
      expect(text.toLowerCase()).not.toContain(phrase)
    }
  })
})

describe("the real Sarah's text", () => {
  const text = textOf(renderToStaticMarkup(<Ask />))
  const { reset, emailChange, phoneChange, recipientAdded, paused } = sarah

  it('keeps the timeline of tonight', () => {
    for (const e of [reset, emailChange, phoneChange, recipientAdded, paused]) {
      expect(text).toContain(clock(e.at))
    }
  })

  it('asks about the money and warns about coaching', () => {
    expect(text).toContain(
      `Are you sending ${money(paused.amount)} to a recipient added at ${clock(recipientAdded.at)}?`,
    )
    expect(clock(recipientAdded.at)).toMatch(/^10:19\sPM$/)
    expect(text).toContain('If a website or caller told you to expect this text, tap No.')
    expect(text).toContain('Sound will never call you and ask you to tap Yes.')
  })
})

describe("the staff case for Sarah's pause", () => {
  const html = renderToStaticMarkup(<TakeoverCase member="M1003" stage="paused" />)
  const text = textOf(html)

  it('still shows the full timeline with its sources', () => {
    const { reset, emailChange, phoneChange, recipientAdded, paused } = sarah
    for (const e of [reset, emailChange, phoneChange, recipientAdded, paused]) {
      expect(text).toContain(clock(e.at))
      expect(html).toContain(e.id)
    }
  })

  it('shows the later kit payment only as what happened without Second Look', () => {
    const { second } = sarah
    const label = text.indexOf('In the kit, without Second Look:')
    const amount = text.indexOf(money(second.amount))
    expect(label).toBeGreaterThan(-1)
    expect(amount).toBeGreaterThan(label)
    expect(text.split(money(second.amount))).toHaveLength(2)
    expect(text).not.toContain(clock(second.at))
  })
})
