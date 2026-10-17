import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { devSessionApi } from './dev/sessionApi.ts'

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

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), demoSync(), devSessionApi()],
  resolve: { alias: { '@kit': kitDir } },
  server: { fs: { allow: ['..'] } },
})
