/** The judge's phone page and the laptop's wall, rendered with fetch mocked. */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { isPanelView, type View } from '../shell/view'
import { judgeName, postLine, PRIVACY, PRIVATE_PAGE, SOURCE_LINE } from './copy'
import { PanelPhone } from './PanelPhone'
import { PanelWall, WallRow } from './PanelWall'
import { clipQuote, GROUP_RESULTS, NO_PATTERN, QUOTE_MAX } from './results'

vi.hoisted(() => {
  Object.assign(globalThis, {
    window: {
      location: { origin: 'https://demo.test', pathname: '/', search: '' },
      addEventListener: () => {},
      removeEventListener: () => {},
    },
  })
})
vi.stubGlobal(
  'fetch',
  vi.fn(async () => new Response(JSON.stringify({ entries: [] }))),
)

const textOf = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ')

describe("a judge's phone", () => {
  const html = renderToStaticMarkup(<PanelPhone code="AB12" />)
  const text = textOf(html)

  it('opens on Linda and asks what the grandson said', () => {
    expect(text).toContain("Scan it. You're Linda.")
    expect(text).toContain("Tell Skipper what the 'grandson' said.")
    expect(text).toContain('Concept: how Skipper could do this.')
    expect(text).toContain('Ask Skipper')
  })

  it('takes typed text only, up to 500 characters', () => {
    expect(html).toMatch(/<textarea[^>]*maxlength="500"/i)
    expect(text).not.toMatch(/microphone|dictat|speak to skipper/i)
  })

  it('says where her words go and what reaches the wall', () => {
    expect(text).toContain(PRIVACY.keywords)
    expect(PRIVACY.keywords).toContain(`first ${QUOTE_MAX} characters`)
    expect(PRIVACY.ai).toContain('AI provider')
  })

  it('says once, and only one way, what reaches the wall', () => {
    for (const mode of ['keywords', 'ai'] as const) {
      const footer = `${PRIVACY[mode]} ${PRIVATE_PAGE}`
      expect(footer.match(/reach(?:es)? the wall/g)).toHaveLength(1)
      expect(footer).not.toMatch(/only your result/i)
    }
    expect(text).toContain(PRIVATE_PAGE)
  })

  it('has no presenter controls or story tabs', () => {
    expect(text).not.toMatch(/Start session|New run|Panel wall|Design check|Next|Both|Staff/)
  })

  it('keeps every button at least 44 px tall and nothing wider than a 320 px phone', () => {
    const buttons = html.match(/<(?:button|a) [^>]*>/g) ?? []
    expect(buttons.length).toBeGreaterThan(0)
    for (const b of buttons) expect(b).toMatch(/\b(?:h-12|min-h-11|min-h-12)\b/)
    for (const [, px] of html.matchAll(/w-\[(\d+)px\]/g)) expect(Number(px)).toBeLessThanOrEqual(288)
  })

  it('without a wall code, says the result stays on the phone', () => {
    expect(textOf(renderToStaticMarkup(<PanelPhone code={null} />))).toContain('stays on this phone')
  })
})

describe('the wall', () => {
  const html = renderToStaticMarkup(<PanelWall code="AB12" />)
  const text = textOf(html)

  it('shows the live heading, the code, and a QR to the phone page', () => {
    expect(text).toContain('PANEL RESULTS ·')
    expect(text).toContain('AB12')
    expect(html).toContain('<svg')
    expect(text).toContain('https://demo.test/?view=panel&amp;wall=AB12')
    expect(text).toContain('Waiting for the first judge.')
  })

  it('lets the presenter add one through the same Skipper', () => {
    expect(text).toContain('Add one yourself')
    expect(text).toContain('Ask Skipper')
  })

  it('shows each line as judge, quote and result', () => {
    const row = textOf(
      renderToStaticMarkup(<WallRow entry={{ n: 3, quote: 'my son needs bail', result: GROUP_RESULTS.grandparent }} />),
    )
    expect(row).toContain('Judge 3')
    expect(row).toContain('“my son needs bail”')
    expect(row).toContain('fits grandparent scam · wire held')
    const own = textOf(renderToStaticMarkup(<WallRow entry={{ n: 4, quote: 'hi', result: NO_PATTERN, judge: 'Presenter' }} />))
    expect(own).toContain('Presenter')
    expect(own).not.toContain('Judge 4')
  })

  it('wraps the 40-character quote instead of cutting it again', () => {
    const quote = clipQuote("lawyer says don't tell mom, my grandson needs bail")
    const html = renderToStaticMarkup(<WallRow entry={{ n: 1, quote, result: GROUP_RESULTS.grandparent }} />)
    const cell = html.match(/<span[^>]*>“[^<]*”<\/span>/)?.[0] ?? ''
    expect(textOf(cell)).toContain(`“${quote}”`)
    expect(cell).not.toMatch(/\b(?:truncate|text-ellipsis|whitespace-nowrap|line-clamp-1)\b/)
  })
})

describe('panel wording', () => {
  it('names the poster and where the result stands', () => {
    expect(judgeName({ n: 2, quote: 'q', result: NO_PATTERN })).toBe('Judge 2')
    expect(postLine('sending')).toContain('Sending')
    expect(postLine({ ok: true, entry: { n: 7, quote: 'q', result: NO_PATTERN } })).toBe('On the wall as Judge 7.')
    expect(postLine({ ok: false, reason: 'full' })).toContain('full')
    expect(postLine({ ok: false, reason: 'busy' })).toContain('busy')
    expect(postLine({ ok: false, reason: 'offline' })).toContain("Couldn't reach")
  })

  it('never says safe, verified or no risk, and has no long dashes', () => {
    for (const line of [...Object.values(PRIVACY), ...Object.values(SOURCE_LINE)]) {
      expect(line).not.toMatch(/\bsafe\b|verified|no risk|[\u2013\u2014]/i)
    }
  })
})

describe('panel views', () => {
  it('stand apart from the demo views', () => {
    const views: View[] = ['both', 'member', 'staff', 'remote', 'panel', 'wall', 'drill']
    expect(views.filter(isPanelView)).toEqual(['panel', 'wall', 'drill'])
  })
})
