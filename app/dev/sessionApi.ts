import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'

/** In-memory twin of api/session.ts so sessions work under `npm run dev` and `npm run demo`. */
export function devSessionApi(): Plugin {
  const store = new Map<string, { json: string; rev: number }>()
  const kinds = ['position', 'look', 'linda', 'report', 'michael', 'run', 'sarah', 'm1039', 'james']
  const valid = /^[A-Z0-9]{4,8}$/

  const readBody = (req: IncomingMessage) =>
    new Promise<string>((resolve) => {
      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => resolve(body))
    })

  return {
    name: 'second-look-dev-session-api',
    configureServer(server) {
      server.middlewares.use('/api/session', async (req, res) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const id = url.searchParams.get('id')?.toUpperCase() ?? ''
        res.setHeader('content-type', 'application/json')
        if (!valid.test(id)) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'bad session id' }))
          return
        }
        if (req.method === 'POST') {
          const { kind, json } = JSON.parse(await readBody(req)) as { kind: string; json: string }
          if (!kinds.includes(kind) || typeof json !== 'string') {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'bad update' }))
            return
          }
          const rev = (store.get(`${id}:${kind}`)?.rev ?? 0) + 1
          store.set(`${id}:${kind}`, { json, rev })
          res.end(JSON.stringify({ rev }))
          return
        }
        res.end(JSON.stringify(Object.fromEntries(kinds.map((k) => [k, store.get(`${id}:${k}`) ?? null]))))
      })
    },
  }
}
