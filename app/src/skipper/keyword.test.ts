/** The keyword baseline: listed taps only, each quoting the exact words of hers that matched. */
import { describe, expect, it } from 'vitest'
import { matchKeywords } from './keyword'
import { allowedIds, type SkipperScreen } from './lists'
import { quoted } from './verify'

const ids = (screen: SkipperScreen, text: string) => matchKeywords(screen, text).map((s) => s.id)

describe('Linda’s tablet', () => {
  it('hears the grandparent scam, typos and all', () => {
    expect(matchKeywords('linda', 'my grandsons lawyer says hes in jail dont tell anyone')).toEqual([
      { id: 'family', quote: 'grandsons' },
      { id: 'official', quote: 'lawyer' },
      { id: 'secret', quote: 'dont tell' },
    ])
    expect(ids('linda', 'Granson got arrested, the public defender needs bail money')).toEqual([
      'family',
      'official',
      'bail',
    ])
    expect(ids('linda', 'my granddaughter was in an accident and the attorney wants it for court fees')).toEqual([
      'family',
      'official',
      'bail',
    ])
  })

  it('hears coaching and a wish to talk privately', () => {
    expect(ids('linda', 'He told me what to say if the bank asks')).toEqual(['coached'])
    expect(ids('linda', "he's listening on speaker, can't talk")).toEqual(['private'])
  })

  it('needs trouble before a grandchild counts', () => {
    expect(ids('linda', 'paying my grandson’s tuition, I set it up with the college')).toEqual([])
    expect(ids('linda', 'my grandson is in jail')).toEqual(['family'])
  })

  it('does not take "fine" for a fine', () => {
    expect(ids('linda', 'everything is fine, just moving money')).toEqual([])
    expect(ids('linda', 'he has to pay a fine today')).toEqual(['bail'])
  })
})

describe('Michael’s card', () => {
  it('hears the relationship investment scam', () => {
    expect(matchKeywords('michael', 'we met online, she says her crypto platform doubles it')).toEqual([
      { id: 'never-met', quote: 'met online' },
      { id: 'investment', quote: 'crypto' },
    ])
    expect(ids('michael', "Haven't met her yet. She needs a withdrawal fee to unlock my profits")).toEqual([
      'never-met',
      'investment',
      'emergency',
    ])
  })

  it('reads Spanish', () => {
    expect(ids('michael', 'Nunca nos hemos visto, dice que la plataforma de inversión paga mucho')).toEqual([
      'never-met',
      'investment',
    ])
  })
})

describe('James’s tablet', () => {
  it('hears the government scam', () => {
    expect(ids('james', 'The IRS says there is a warrant, buy gift cards and stay on the phone')).toEqual([
      'investigation',
      'secret',
      'waiting',
    ])
    expect(ids('james', 'they said move my savings to a safe account')).toEqual(['move'])
  })
})

describe('the panel', () => {
  it('tags each tap with its scam', () => {
    expect(ids('panel', 'lawyer says my grandson is in jail, don’t tell mom')).toEqual([
      'grandparent.family',
      'grandparent.official',
      'grandparent.secret',
      'government.secret',
      'romance.secret',
    ])
  })
})

describe('every answer', () => {
  const SAMPLES: [SkipperScreen, string][] = [
    ['linda', 'my grandsons lawyer says hes in jail dont tell anyone, on speaker'],
    ['michael', 'met on a dating app, crypto platform, keep it from my kids, customs fee'],
    ['james', 'FBI warrant, courier is waiting outside, if the teller asks say it is for a car'],
    ['sarah', 'someone from Sound fraud department asked for the code, I did not make that payment'],
    ['panel', 'IRS warrant, buy gift cards'],
  ]

  it.each(SAMPLES)('on %s is listed and quotes her own words', (screen, text) => {
    const found = matchKeywords(screen, text)
    expect(found.length).toBeGreaterThan(0)
    for (const s of found) {
      expect(allowedIds(screen)).toContain(s.id)
      expect(text).toContain(s.quote)
      expect(quoted(s.quote, text)).toBe(true)
    }
  })

  it('is empty for an empty box', () => {
    expect(matchKeywords('linda', '   ')).toEqual([])
  })
})
