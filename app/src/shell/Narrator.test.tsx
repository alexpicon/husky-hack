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
