/** Every answer on M1039's confirmation screens leads somewhere, and so does no answer. */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CheckScreen } from './CheckScreen'
import { TapScreen } from './TapScreen'

const look = vi.hoisted(() => ({ current: 'concept' as 'concept' | 'sound' }))

// The real look switch syncs across windows, which needs a browser; these tests pick the look.
vi.mock('../../ui/look', () => ({ useLook: () => look.current }))

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')

/** The labels of the rendered buttons, in order. */
const buttons = (html: string) =>
  [...html.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => textOf(m[1]).trim())

describe.each(['concept', 'sound'] as const)("the text to M1039's phone (%s look)", (variant) => {
  look.current = variant
  const unanswered = renderToStaticMarkup(<TapScreen />)
  const no = textOf(renderToStaticMarkup(<TapScreen answered="no" />))
  const notSure = textOf(renderToStaticMarkup(<TapScreen answered="not-sure" />))

  it('offers Yes, No and Not sure', () => {
    expect(buttons(unanswered)).toEqual(['Yes, it was me', "No, it wasn't me", 'Not sure'])
  })

  it('stops the payment, holds new payees and starts a staff check on No', () => {
    expect(no).toContain("No, it wasn't me")
    expect(no).toContain("This payment is stopped and won't be sent.")
    expect(no).toContain('New payees are on hold while a Sound specialist checks your account')
    expect(no).not.toContain('Yes, it was me')
  })

  it('keeps it paused and has Sound call the number on file on Not sure', () => {
    expect(notSure).toContain('The payment stays paused and nothing is sent.')
    expect(notSure).toContain('will call you at this number, the one on file')
    expect(notSure).not.toContain('Yes, it was me')
  })

  it('says what happens if nobody answers in 4 hours, until an answer comes', () => {
    expect(textOf(unanswered)).toContain(
      "No answer within 4 hours? It isn't sent. We'll text and call this number, and you can send it again.",
    )
    const answered = (['yes', 'no', 'not-sure', 'lost-phone'] as const).map((a) =>
      textOf(renderToStaticMarkup(<TapScreen answered={a} />)),
    )
    for (const text of answered) expect(text).not.toContain('No answer within')
  })
})

describe.each(['concept', 'sound'] as const)("M1039's in-app check (%s look)", (variant) => {
  look.current = variant
  const open = renderToStaticMarkup(<CheckScreen />)
  const lost = renderToStaticMarkup(<CheckScreen phoneLost />)

  it('offers the messages and a way out for a lost phone', () => {
    expect(buttons(open)).toEqual(['Check your messages', 'I lost that phone'])
  })

  it('sends a lost phone to the card number or a branch, and sends nothing meanwhile', () => {
    const text = textOf(lost)
    expect(text).toContain("We won't send it yet")
    expect(text).toContain('Call the number on your card or visit any Sound branch with your ID')
    expect(buttons(lost)).toEqual([])
  })

  it('says what happens if nobody answers in 4 hours, naming no contact detail', () => {
    for (const html of [open, lost]) {
      expect(textOf(html)).toContain("No answer within 4 hours? It isn't sent, and you can send it again.")
    }
  })
})

const sources = import.meta.glob(
  ['../sarah/*.tsx', './*.tsx', '../staff/Takeover*.tsx', '../staff/{Signals,Money,Contacts,Response}Panel.tsx', '!**/*.test.tsx'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

/** Each opening tag of these elements, read to its closing `>` outside any `{...}`. */
function openingTags(source: string, names: string[]): string[] {
  const tags: string[] = []
  for (const name of names) {
    for (const match of source.matchAll(new RegExp(`<${name}[\\s>]`, 'g'))) {
      let depth = 0
      let i = match.index
      while (i < source.length && !(source[i] === '>' && depth === 0)) {
        if (source[i] === '{') depth++
        if (source[i] === '}') depth--
        i++
      }
      tags.push(source.slice(match.index, i + 1))
    }
  }
  return tags
}

describe('buttons on the takeover screens', () => {
  it('finds the files it checks', () => {
    expect(Object.keys(sources)).toEqual(
      expect.arrayContaining(['./TapScreen.tsx', './CheckSound.tsx', '../sarah/Ask.tsx', '../staff/TakeoverActions.tsx']),
    )
  })

  it.each(Object.keys(sources))('%s gives every button a handler', (file) => {
    for (const tag of openingTags(sources[file], ['button', 'SoundButton', 'ActionButton'])) {
      expect(tag).toMatch(/\bonClick=/)
    }
  })
})
