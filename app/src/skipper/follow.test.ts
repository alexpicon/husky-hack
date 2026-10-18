/** How Skipper's chat follows itself on a device screen: its newest line comes into view. */
import { describe, expect, it, vi } from 'vitest'
import { scrollBehavior, showLatest } from './follow'

const device = (reduce: boolean) => ({
  matchMedia: (query: string) => ({ matches: reduce && query === '(prefers-reduced-motion: reduce)' }) as MediaQueryList,
})

describe('bringing her newest line into view', () => {
  it('brings the last line to the nearest edge, so a chat already in view stays put', () => {
    const end = { scrollIntoView: vi.fn() }
    showLatest(end, device(false))
    expect(end.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
  })

  it('jumps instead of gliding when the device asks for less motion', () => {
    const end = { scrollIntoView: vi.fn() }
    showLatest(end, device(true))
    expect(end.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' })
    expect(scrollBehavior(device(true))).toBe('auto')
  })

  it('does nothing without a line or a way to scroll, and glides where no device says otherwise', () => {
    expect(() => showLatest(null)).not.toThrow()
    expect(() => showLatest({} as Pick<Element, 'scrollIntoView'>)).not.toThrow()
    expect(scrollBehavior({} as Pick<Window, 'matchMedia'>)).toBe('smooth')
    expect(scrollBehavior()).toBe('smooth')
  })
})
