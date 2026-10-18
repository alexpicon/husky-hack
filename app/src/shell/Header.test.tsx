import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { events, memberKeys } from '../data/kit'
import { Header } from './Header'

// The session module reads window.location as it loads.
vi.hoisted(() => {
  Object.assign(globalThis, { window: { location: { search: '' } } })
})

const html = renderToStaticMarkup(
  <Header tabs={[{ id: 'a', label: 'A', sublabel: 'a', tone: 'brand' }]} active="a" onSelect={() => {}} />,
)
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('header', () => {
  it('carries the tagline under the name', () => {
    expect(text).toContain('One true fact, to the right person.')
    expect(text.indexOf('Second Look')).toBeLessThan(text.indexOf('One true fact'))
    expect(html).not.toContain('\u2014')
  })

  it('keeps the data badge, counted from the kit', () => {
    expect(text).toContain(`${events.length.toLocaleString()} kit events`)
    expect(text).toContain(`${memberKeys.length} members`)
  })
})
