import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const kitDir = fileURLToPath(new URL('../huskyhacks', import.meta.url))

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@kit': kitDir } },
  server: { fs: { allow: ['..'] } },
})
