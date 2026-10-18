/** The code check on Skipper's note: two plain sentences at most, no numbers, no verdict. */
import { describe, expect, it } from 'vitest'
import { checkNote } from './note'

const GOOD = "Member says her grandson's lawyer called, he's in jail, and she was told not to tell anyone."

describe('checkNote', () => {
  it('passes one or two plain sentences', () => {
    expect(checkNote(GOOD)).toBe(GOOD)
    expect(checkNote(`${GOOD} She is unsure who to call.`)).toBe(`${GOOD} She is unsure who to call.`)
    expect(checkNote(`  ${GOOD}\n`)).toBe(GOOD)
  })

  it('refuses a third sentence', () => {
    expect(checkNote(`${GOOD} She is upset. She wants to send it.`)).toBeNull()
  })

  it('refuses numbers and amounts', () => {
    expect(checkNote('Member says she needs to send 5000 today.')).toBeNull()
    expect(checkNote('Member was asked for $5k.')).toBeNull()
    expect(checkNote('Member was asked for five thousand dollars.')).toBeNull()
  })

  it.each([
    'This looks safe.',
    'Scam confirmed by the member.',
    'Fraud confirmed.',
    'The member confirmed the payee.',
    'Staff can release the wire.',
    'Approve the payment.',
    'The caller was verified.',
    'There is no risk here.',
    'Staff should call her back.',
  ])('refuses a verdict or advice: %s', (note) => {
    expect(checkNote(note)).toBeNull()
  })

  it('refuses empty, overlong, marked-up or non-text notes', () => {
    expect(checkNote('')).toBeNull()
    expect(checkNote('   ')).toBeNull()
    expect(checkNote(`Member says ${'a lot '.repeat(60)}.`)).toBeNull()
    expect(checkNote('<b>Member</b> says hi.')).toBeNull()
    expect(checkNote(null)).toBeNull()
    expect(checkNote({ note: GOOD })).toBeNull()
  })
})
