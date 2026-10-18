import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { devPanelApi } from './dev/panelApi.ts'
import { devSessionApi } from './dev/sessionApi.ts'
import { devSkipperApi } from './dev/skipperApi.ts'

const kitDir = fileURLToPath(new URL('../huskyhacks', import.meta.url))

/** Relays demo state between laptops that open the same dev server. */
function demoSync(): Plugin {
  const event = 'second-look-sync'
  return {
    name: 'second-look-sync',
    configureServer(server) {
      server.ws.on(event, (data, client) => {
        for (const other of server.ws.clients) {
          if (other !== client) other.send(event, data)
        }
      })
    },
  }
}

/** Server-only settings the dev twins of api/ read; none has a VITE_ prefix, so none reaches the browser. */
const SERVER_ENV = ['ANTHROPIC_API_KEY', 'SKIPPER_AI', 'SKIPPER_MODEL', 'KV_REST_API_URL', 'KV_REST_API_TOKEN']

export default defineConfig(({ mode }) => {
  // Tests never see a real key or store. The shell wins over app/.env.local.
  const file: Record<string, string> = mode === 'test' ? {} : loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), SERVER_ENV)
  for (const name of SERVER_ENV) if (file[name] && !process.env[name]) process.env[name] = file[name]
  return {
    base: './',
    plugins: [react(), tailwindcss(), demoSync(), devSessionApi(), devPanelApi(), devSkipperApi()],
    resolve: { alias: { '@kit': kitDir } },
    server: { fs: { allow: ['..'] } },
  }
})
