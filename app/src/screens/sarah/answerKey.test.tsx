/**
 * The Member Key is the kit's answer sheet. Screens read it only to show what happened in the
 * kit without Second Look, and only through two files.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { money } from '../../ui/format'
import { TakeoverCase } from '../staff/TakeoverCase'
import { takeoverFacts } from '../staff/takeoverFacts'
import { SARAH_NAME } from './facts'

const raw = import.meta.glob(['../**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Each file's source by its path under screens/; this folder's files come back as "./X". */
const sources = Object.fromEntries(
  Object.entries(raw).map(([key, source]) => [key.replace(/^\.\//, 'sarah/').replace(/^\.\.\//, ''), source]),
)

/** The only files that may read the key, each for a labeled kit comparison. */
const ALLOWED = ['sarah/facts.ts', 'staff/takeoverFacts.ts']

/** Linda's files, which her own answer-key test covers. */
const LINDA = /^(linda\/|staff\/(Tricked[^/]*|CheckPanels\.tsx|WirePanels\.tsx|trickedFacts\.ts)$)/

const READS_KEY = /\b(keyFor|memberKeys)\b|Member_Key/

const files = Object.keys(sources)

describe('who reads the Member Key under screens/', () => {
  it('finds the files it checks', () => {
    expect(files).toEqual(expect.arrayContaining(['sarah/facts.ts', 'm1039/facts.ts', 'staff/TakeoverCase.tsx']))
  })

  it('finds a read in each allowed file, so the check can fail', () => {
    for (const allowed of ALLOWED) expect(sources[allowed]).toMatch(READS_KEY)
  })

  it.each(files.filter((f) => !ALLOWED.includes(f) && !LINDA.test(f)))('%s never reads it', (f) => {
    expect(sources[f]).not.toMatch(READS_KEY)
  })
})

describe('what the allowed reads show', () => {
  it('names Sarah from the starter kit, not from the key', () => {
    expect(takeoverFacts('M1003').name).toBe(SARAH_NAME)
    expect(takeoverFacts('M1039').name).toBe('Member M1039')
    expect(sources['staff/takeoverFacts.ts']).not.toMatch(/\.persona\b/)
  })

  it("shows Sarah's kit loss only after the label", () => {
    const f = takeoverFacts('M1003')
    const text = renderToStaticMarkup(<TakeoverCase member="M1003" stage="secured" />)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
    const label = text.indexOf('In the kit, without Second Look:')
    expect(label).toBeGreaterThan(-1)
    for (const amount of [money(f.dollarsSent), money(f.netLoss)]) {
      expect(text.indexOf(amount)).toBeGreaterThan(label)
    }
  })
})
