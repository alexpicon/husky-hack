import { fileURLToPath } from 'node:url'
import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'

type Fn = { GET: () => Response; POST: (request: Request) => Promise<Response> }

const fnPath = fileURLToPath(new URL('../../api/skipper.ts', import.meta.url))

/**
 * Serves api/skipper.ts itself under `npm run dev` and `npm run demo`, so the dev server runs the
 * same checks. It reads ANTHROPIC_API_KEY and SKIPPER_AI from the shell that started Vite.
 */
export function devSkipperApi(): Plugin {
  const readBody = (req: IncomingMessage) =>
    new Promise<string>((resolve) => {
      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', () => resolve(body))
    })

  return {
    name: 'second-look-dev-skipper-api',
    configureServer(server) {
      server.middlewares.use('/api/skipper', async (req, res) => {
        const fn = (await server.ssrLoadModule(fnPath)) as Fn
        const response =
          req.method === 'POST'
            ? await fn.POST(
                new Request('http://localhost/api/skipper', {
                  method: 'POST',
                  headers: { 'x-forwarded-for': req.socket.remoteAddress ?? 'local' },
                  body: await readBody(req),
                }),
              )
            : fn.GET()
        res.statusCode = response.status
        res.setHeader('content-type', 'application/json')
        res.end(await response.text())
      })
    },
  }
}
