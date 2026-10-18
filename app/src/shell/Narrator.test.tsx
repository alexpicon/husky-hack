import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Step } from '../story/engine'
import { Narrator } from './Narrator'

const step = (id: string): Step => ({ id, title: `Title ${id}`, caption: '', clock: '10:22 PM', member: null, staff: null })
const steps = ['a', 'b', 'c'].map(step)
const noop = () => {}

describe('the step dots', () => {
  const html = renderToStaticMarkup(
    <Narrator steps={steps} index={1} onPrev={noop} onNext={noop} onGo={noop} />,
  )

  it('are a labeled group of buttons, not tabs', () => {
    expect(html).toContain('role="group" aria-label="Steps"')
    expect(html).not.toMatch(/role="tab/)
  })

  it('mark only the step on screen as current', () => {
    expect(html.match(/aria-current="step"/g)).toHaveLength(1)
    expect(html).toMatch(/aria-label="Step 2: Title b" aria-current="step"/)
  })
})

describe('the opening line', () => {
  const render = (opening?: string) =>
    renderToStaticMarkup(
      <Narrator steps={[{ ...step('a'), opening }]} index={0} onPrev={noop} onNext={noop} onGo={noop} />,
    )

  it('shows as a quote above the headline when the step has one', () => {
    const html = render('A line someone said.')
    expect(html).toMatch(/<blockquote[^>]*>A line someone said\.<\/blockquote>/)
    expect(html.indexOf('<blockquote')).toBeLessThan(html.indexOf('<h1'))
  })

  it('is left out when the step has none', () => {
    expect(render()).not.toContain('<blockquote')
  })
})

describe('the pitch line', () => {
  it('shows above the step counter when given, and not otherwise', () => {
    const line = 'What sets us apart.'
    const html = renderToStaticMarkup(
      <Narrator steps={steps} index={0} onPrev={noop} onNext={noop} onGo={noop} pitch={line} />,
    )
    expect(html.indexOf(line)).toBeGreaterThan(-1)
    expect(html.indexOf(line)).toBeLessThan(html.indexOf('01 / 03'))
    const without = renderToStaticMarkup(
      <Narrator steps={steps} index={0} onPrev={noop} onNext={noop} onGo={noop} />,
    )
    expect(without).not.toContain(line)
  })
})
