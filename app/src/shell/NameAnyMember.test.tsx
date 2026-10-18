/** The "Name any member" panel: every kit member renders, the two sections stay apart, the key stays out of the rules. */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { keyFor, memberKeys } from '../data/kit'
import { answerFor } from './memberAnswer'
import { members } from './memberReplay'
import { NameAnyMember } from './NameAnyMember'
import { PilotView } from './PilotView'
import { REPLAY_RULES } from './replayRules'
import { ResultsMatrix } from './ResultsMatrix'

const SAW = 'What the rules saw (events up to that moment)'
const HAPPENED = 'What really happened (answer key, used only for scoring)'
const NOTHING = 'No rule fired for this member.'

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')

const render = (member: string) => textOf(renderToStaticMarkup(<NameAnyMember initial={member} />))

describe('every kit member', () => {
  it.each(members)('%s renders both sections, the rules first', (member) => {
    const text = render(member)
    expect(text.indexOf(SAW)).toBeGreaterThan(-1)
    expect(text.indexOf(HAPPENED)).toBeGreaterThan(text.indexOf(SAW))
    expect(text).toContain(member)
  })
})

describe('the panel', () => {
  it('says it is tested on the same members, counted from the kit', () => {
    expect(members).toHaveLength(memberKeys.length)
    expect(render('M1001')).toContain(`Tested on the same ${memberKeys.length} members the rules were designed against.`)
  })

  it('shows on the Design check', () => {
    const text = textOf(renderToStaticMarkup(<PilotView />))
    expect(text).toContain('Name any member')
    expect(text).toContain(SAW)
  })

  it('offers every member in the list', () => {
    const html = renderToStaticMarkup(<NameAnyMember initial="M1039" />)
    for (const m of members) expect(html).toContain(`<option value="${m}">`)
  })

  it('names the rule, its time and its fact for Linda', () => {
    const text = render('M1001')
    expect(text).toContain('Linda’s rule')
    expect(text).toContain('Wire $8,500.00 to a payee added that day, 4.77x')
    expect(text).not.toContain(NOTHING)
  })

  it('says plainly when no rule fired, without calling the member fine', () => {
    const routine = members.find((m) => keyFor(m).scenario === 'Normal Activity' && !keyFor(m).lookalike)!
    const text = render(routine)
    const saw = text.slice(text.indexOf(SAW), text.indexOf(HAPPENED))
    expect(saw).toContain(NOTHING)
    expect(saw).toContain('not a finding about what happened')
    expect(saw).not.toMatch(/\b(safe|verified|no risk|fine)\b/i)
  })

  it("uses the Design check's names for its rules", () => {
    const matrix = textOf(renderToStaticMarkup(<ResultsMatrix />))
    for (const rule of REPLAY_RULES.filter((r) => r.key !== 'followUp')) expect(matrix).toContain(rule.label)
  })
})

describe('what really happened', () => {
  it("shows Linda's whole Member Key row and her loss", () => {
    const a = answerFor('M1001')
    expect(a).toMatchObject({ group: 'Family Emergency', scam: true, netLoss: 8500 })
    expect(a.fields.map((f) => f.column)).toContain('journey_summary')
    expect(a.fields.find((f) => f.column === 'net_member_loss')?.value).toBe('$8,500.00')
    expect(a.fields.find((f) => f.column === 'scam_payment_ids')?.value).toBe('P1001-003;P1001-004')
    expect(render('M1001')).toContain('Scam victim')
  })

  it('scores M1039 as an honest look-alike', () => {
    expect(answerFor('M1039')).toMatchObject({ group: 'Look-alike', scam: false, netLoss: 0 })
    expect(render('M1039')).toContain('Honest member')
  })

  it('agrees with the key for every member', () => {
    for (const m of members) expect(answerFor(m).netLoss).toBe(keyFor(m).netLoss)
  })
})

const sources = import.meta.glob(
  ['./{memberReplay,replayRules,memberAnswer}.ts', './{NameAnyMember,ReplaySaw,ReplayTimeline,ReplayAnswer}.tsx'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

const READS_KEY = /\b(keyFor|memberKeys|MemberKey)\b|Member_Key/

/** The only file that reads the key, for the "what really happened" section. */
const ALLOWED = ['./memberAnswer.ts']

/** The files behind "what the rules saw". */
const RULES_SIDE = ['./memberReplay.ts', './replayRules.ts', './ReplaySaw.tsx', './ReplayTimeline.tsx']

describe('who reads the Member Key in this panel', () => {
  it('finds the files it checks', () => {
    expect(Object.keys(sources).sort()).toEqual(
      [...ALLOWED, ...RULES_SIDE, './NameAnyMember.tsx', './ReplayAnswer.tsx'].sort(),
    )
  })

  it('reads it only in the answer file', () => {
    expect(Object.keys(sources).filter((f) => READS_KEY.test(sources[f]))).toEqual(ALLOWED)
  })

  it.each(RULES_SIDE)('%s never reaches the answer file', (file) => {
    expect(sources[file]).not.toMatch(/memberAnswer|ReplayAnswer/)
  })
})
