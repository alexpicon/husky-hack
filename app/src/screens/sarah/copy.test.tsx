/** The words on Sarah's real phone and on the staff case, in each open-decision variant. */
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { POLICY } from '../../data/policy'
import { money } from '../../ui/format'
import { NotMe } from './NotMe'
import { Secured } from './Secured'
import { sarah } from './facts'

// The real look switch syncs across windows, which needs a browser.
vi.mock('../../ui/look', () => ({ useLook: () => 'concept' }))

const defaults = { ...POLICY }
afterEach(() => Object.assign(POLICY, defaults))

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')

const secured = () => textOf(renderToStaticMarkup(<Secured />))

describe("Sarah's phone once the account is locked", () => {
  it('says what was done, never that the account is now "safe"', () => {
    const text = secured()
    expect(text).toContain('We stopped the payment and locked online access')
    expect(text).toContain(`We stopped the ${money(sarah.paused.amount)} payment before it was sent.`)
    expect(text).not.toMatch(/account is\s+safe/i)
  })

  it('holds every payment until she talks to Sound when the case hold is "all"', () => {
    POLICY.caseHold = 'all'
    expect(secured()).toContain("Until we've talked, every payment from your account waits for your OK.")
  })

  it('keeps her bills and autopays running when the case hold is "risky"', () => {
    POLICY.caseHold = 'risky'
    const text = secured()
    expect(text).toContain('Bills and autopays you already set up keep running. New payees wait until we talk.')
    expect(text).not.toContain('every payment from your account')
  })
})

describe('the warning under the text from Sound', () => {
  it('says Sound never calls or texts for a code', () => {
    expect(textOf(renderToStaticMarkup(<NotMe />))).toContain(
      "Sound will never call or text to ask for a code. If a website or caller asks for one, it's a scam.",
    )
  })
})
