import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { POLICY } from '../data/policy'

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ')

async function renderWith(lindaRule: typeof POLICY.lindaRule) {
  vi.resetModules()
  vi.doMock('../data/policy', async (load) => {
    const real = await load<{ POLICY: typeof POLICY }>()
    return { POLICY: { ...real.POLICY, lindaRule } }
  })
  const { ResultsMatrix } = await import('./ResultsMatrix')
  return text(renderToStaticMarkup(<ResultsMatrix />))
}

describe('design check matrix', () => {
  it('describes and scores the per-wire 3x rule', async () => {
    const page = await renderWith('per-wire-3x')
    expect(page).toContain('wire ≥ 3x 12-month 90th-percentile, payee added < 1 day ago')
    expect(page).toContain('Family emergency (Linda) 0 / 12 0 / 12 10 / 12')
    expect(page).toContain('Honest look-alikes 0 / 20 4 / 20 0 / 20')
  })

  it('describes and scores the same-day 2.5x rule', async () => {
    const page = await renderWith('same-day-2.5x')
    expect(page).toContain('day’s wires to one payee ≥ 2.5x 12-month 90th-percentile, payee added < 1 day ago')
    expect(page).toContain('Family emergency (Linda) 0 / 12 0 / 12 12 / 12')
    expect(page).toContain('Honest look-alikes 0 / 20 4 / 20 0 / 20')
  })

  it('never calls the ratio "usual"', async () => {
    expect(await renderWith('per-wire-3x')).not.toMatch(/usual/)
  })
})
