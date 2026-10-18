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
  it('carries the hook in two short lines under the name', () => {
    expect(html).toContain('<span class="block">Facts go to the real member,</span>')
    expect(html).toContain('<span class="block">never to whoever is logged in.</span>')
    expect(text.indexOf('Second Look')).toBeLessThan(text.indexOf('Facts go to the real member'))
  })

  it('keeps the data badge, counted from the kit', () => {
    expect(text).toContain(`${events.length.toLocaleString()} kit events`)
    expect(text).toContain(`${memberKeys.length} members`)
  })
})
