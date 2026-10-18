/** Each story's opening line: present, plain, and backed word for word by the kit. */
import starterKit from '@kit/HuskyHack_Synthetic_Starter_Kit.md?raw'
import { describe, expect, it } from 'vitest'
import { eventsFor } from '../data/kit'
import { OPENINGS } from './openings'

const notes = (member: string) => eventsFor(member).map((e) => e.note).join(' | ')

describe('the opening lines', () => {
  it('cover all five stories', () => {
    expect(Object.keys(OPENINGS).sort()).toEqual(['james', 'linda', 'm1039', 'michael', 'sarah'])
  })

  it.each(Object.entries(OPENINGS))('%s: no digits, no age, no em or en dash', (_, line) => {
    expect(line).not.toMatch(/\d/)
    expect(line).not.toMatch(/\b(age|aged|years? old)\b/i)
    expect(line).not.toMatch(/[\u2013\u2014]/)
    expect(line.length).toBeLessThan(140)
  })
})

describe('the kit behind each line', () => {
  it("Linda: a 'grandson', bail, and an 'attorney' who said not to discuss it", () => {
    expect(starterKit).toContain('someone claiming to be her grandson')
    expect(starterKit).toContain('A second caller poses as an attorney')
    expect(notes('M1001')).toContain("told by 'attorney' not to discuss")
    expect(notes('M1001')).toContain("'bail'")
    expect(OPENINGS.linda).toContain('Grandma')
    expect(OPENINGS.linda).toContain('bail')
    expect(OPENINGS.linda).toContain("'attorney'")
  })

  it('Sarah: a text that seems to be from Sound, a fake site, the code from her phone', () => {
    expect(starterKit).toContain('receives a text appearing to come from Sound')
    expect(notes('M1003')).toContain("Code sent to member's phone; member entered it on fake site")
    expect(OPENINGS.sarah).toContain('fake site')
  })

  it('M1039: failed sign-ins, a reset and a new address, then a new recipient the next day', () => {
    const all = eventsFor('M1039')
    const reset = all.find((e) => e.type === 'Password Reset')!
    const address = all.find((e) => e.type === 'Address Change' && e.at >= reset.at)!
    const added = all.find((e) => e.type === 'Recipient Added' && e.at > address.at)!
    expect(all.some((e) => e.type === 'Failed Login' && e.at < reset.at)).toBe(true)
    expect(address.at.toDateString()).toBe(reset.at.toDateString())
    expect(added.recipientStatus).toBe('New')
    expect(added.at.getDate() - address.at.getDate()).toBe(1)
  })

  it('Michael: a widower, an online relationship, small payments that grow', () => {
    expect(starterKit).toContain('Michael, a widower')
    expect(starterKit).toContain('develops an online relationship')
    expect(starterKit).toContain('Small P2P transfers grow in frequency and size')
  })

  it('James: a federal investigation, move money now, do not discuss it', () => {
    expect(starterKit).toContain('his identity is linked to a federal investigation')
    expect(starterKit).toContain('move money immediately and not discuss the matter')
  })
})
