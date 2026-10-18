/** The wire desk never shows a kit event from after the story clock. */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { storyTimes } from '../linda/facts'
import { TrickedCase } from './TrickedCase'
import { trickedFacts } from './trickedFacts'

const spoken = trickedFacts('M1001').spokenCheck!
const at = (now: Date, stage: 'held' | 'checked') =>
  renderToStaticMarkup(<TrickedCase member="M1001" stage={stage} now={now} />)

describe("the spoken check (the kit's 2:14 PM note)", () => {
  const t = storyTimes()

  it('is the E00048 confirmation request', () => {
    expect(spoken.id).toBe('E00048')
    expect(spoken.note.split(';')[0]).toBe('Member insisted')
  })

  it.each([
    ['today', t.caught],
    ['silent-check', t.check],
  ])('stays off the %s step', (_, now) => {
    const html = at(now, 'held')
    expect(html).not.toContain(spoken.id)
    expect(html).not.toContain(spoken.note.split(';')[0])
  })

  it('shows once the story clock reaches it', () => {
    expect(at(t.match, 'checked')).toContain(spoken.id)
  })
})
