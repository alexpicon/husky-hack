import starterKit from '@kit/HuskyHack_Synthetic_Starter_Kit.md?raw'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PilotView } from './PilotView'

const html = renderToStaticMarkup(<PilotView />)

const KIT_MEASURES = [
  'Dollars of harm prevented',
  'False-positive rate',
  'Time from hold to release for legitimate members',
  'Employee effort',
  'After-hours holds waiting for review',
]

function measureRows() {
  const caption = html.indexOf('Assumptions, not Sound data')
  const body = html.slice(html.indexOf('<tbody>', caption), html.indexOf('</tbody>', caption))
  return [...body.matchAll(/<tr[^>]*>(.*?)<\/tr>/g)].map(([, row]) =>
    [...row.matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/g)].map(([, cell]) =>
      cell.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    ),
  )
}

describe('the named miss', () => {
  it('says no rule fires on Michael and names the report path the member sees', () => {
    expect(html).toContain('no rule fires')
    expect(html).toContain('I think I’ve been scammed')
    expect(html).not.toMatch(/can’t be recalled|I think I was scammed/)
  })
})

describe('pilot', () => {
  it('labels every baseline and target as an assumption', () => {
    expect(html).toContain('Assumptions, not Sound data')
    expect(html).toContain('Assumed today')
    expect(html).toContain('Pilot target')
  })

  it('names each row after a success measure in the starter kit', () => {
    const rows = measureRows()
    expect(rows.map(([name]) => KIT_MEASURES.find((m) => name.startsWith(m)))).toEqual(KIT_MEASURES)
    for (const m of KIT_MEASURES) expect(starterKit).toContain(m)
  })

  it('gives every measure a baseline and a target', () => {
    for (const [, today, target] of measureRows()) {
      expect(today).toMatch(/\w/)
      expect(target).toMatch(/\w/)
    }
  })

  it('starts small, after a shadow month, with a stop rule that reviews more than thresholds', () => {
    expect(html).toContain('Days 1-30: shadow month')
    expect(html).toContain('Live at 2 branches, the wire desk and a small opted-in digital group.')
    expect(html).toContain(
      'If honest members are paused too often, review the rule, staffing and group before expanding.',
    )
    expect(html).toContain('triggered test cases paused before send (integration tests)')
    expect(html).not.toMatch(/for everyone|raise thresholds before expanding/)
  })
})
