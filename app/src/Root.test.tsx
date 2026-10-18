/** Which page a link opens, and which shared demo state it joins: the panel pages join none. */
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Root } from './Root'

const page = vi.hoisted(() => {
  const location = { origin: 'https://demo.test', pathname: '/', search: '', hash: '', href: 'https://demo.test/' }
  Object.assign(globalThis, {
    window: { location, addEventListener: () => {}, removeEventListener: () => {} },
  })
  return location
})
const synced = vi.hoisted(() => [] as string[])
vi.mock('./shell/sync', () => ({ useWindowSync: (kind: string) => void synced.push(kind) }))
// The real session store has no server snapshot; a page rendered here is in no session.
vi.mock('./shell/remote', async (actual) => ({
  ...(await actual<typeof import('./shell/remote')>()),
  useSession: () => ({ id: null, status: 'off' }),
}))
vi.stubGlobal(
  'fetch',
  vi.fn(async () => new Response(JSON.stringify({ entries: [] }))),
)

const open = (search: string) => {
  page.search = search
  return renderToStaticMarkup(<Root />)
}

beforeEach(() => {
  synced.length = 0
})

describe('a panel page', () => {
  it.each([
    ['?view=wall&wall=AB12', 'PANEL RESULTS'],
    ['?view=panel&wall=AB12', 'Ask Skipper'],
    ['?view=drill', 'Real or AI?'],
  ])('%s shows its own page and joins none of the demo state, so it cannot move the demo', (search, text) => {
    expect(open(search)).toContain(text)
    expect(synced).toEqual([])
  })
})

describe('the demo', () => {
  it.each(['', '?view=staff', '?view=remote'])('%s shares its story position, run, case, look and Skipper', (search) => {
    open(search)
    expect(synced).toEqual(expect.arrayContaining(['position', 'run', 'linda', 'look', 'skipper']))
  })
})
