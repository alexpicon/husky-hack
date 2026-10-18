import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { clipQuote, isPanelResult, JUDGE_LABEL, WALL_CODE, WALL_LIMITS, type PanelEntry } from '../src/panel/results.ts'

/** In-memory twin of api/panel.ts so the panel wall works under `npm run dev` and `npm run demo`. */
export function devPanelApi(): Plugin {
  const walls = new Map<string, { entries: PanelEntry[]; count: number }>()
  const ips = new Map<string, { count: number; until: number }>()

  const readBody = (req: IncomingMessage) =>
    new Promise<string>((resolve) => {
      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => resolve(body))
    })

  const send = (res: ServerResponse, status: number, body: unknown) => {
    res.statusCode = status
    res.end(JSON.stringify(body))
  }

  const parse = (text: string) => {
    try {
      return JSON.parse(text) as { quote?: unknown; result?: unknown; judge?: unknown }
    } catch {
      return null
    }
  }

  const overLimit = (ip: string) => {
    const now = Date.now()
    const found = ips.get(ip)
    const slot = found && found.until > now ? found : { count: 0, until: now + WALL_LIMITS.ipWindowSeconds * 1000 }
    slot.count += 1
    ips.set(ip, slot)
    return slot.count > WALL_LIMITS.perIp
  }

  return {
    name: 'second-look-dev-panel-api',
    configureServer(server) {
      server.middlewares.use('/api/panel', async (req, res) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const code = url.searchParams.get('id')?.toUpperCase() ?? ''
        res.setHeader('content-type', 'application/json')
        if (!WALL_CODE.test(code)) return send(res, 400, { error: 'bad wall code' })
        const wall = walls.get(code) ?? { entries: [], count: 0 }
        if (req.method !== 'POST') return send(res, 200, { entries: wall.entries })

        const body = parse(await readBody(req))
        const quote = typeof body?.quote === 'string' ? clipQuote(body.quote) : ''
        if (!body || !quote || !isPanelResult(body.result)) return send(res, 400, { error: 'bad entry' })
        if (overLimit(req.socket.remoteAddress ?? 'unknown')) return send(res, 429, { error: 'busy' })
        if (wall.count >= WALL_LIMITS.perCode) return send(res, 429, { error: 'full' })
        const judge = typeof body.judge === 'string' && JUDGE_LABEL.test(body.judge.trim()) ? body.judge.trim() : null
        const entry: PanelEntry = { n: wall.count + 1, quote, result: body.result, ...(judge ? { judge } : {}) }
        walls.set(code, { count: entry.n, entries: [...wall.entries, entry].slice(-WALL_LIMITS.keep) })
        send(res, 200, { entry })
      })
    },
  }
}
