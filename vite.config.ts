import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), netlify(), tanstackStart(), viteReact(), {
    name: 'daystar-offline-assets',
    generateBundle(options, bundle) {
      if (options.dir?.includes('server') || options.format !== 'es') return
      const assets = Object.keys(bundle).filter((path) => /\.(?:js|css|woff2?|svg|png|webp)$/.test(path)).map((path) => '/' + path)
      const version = createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0, 16)
      const worker = readFileSync(new URL('./public/notifications-sw.js', import.meta.url), 'utf8').replace('daystar-shell-20261018-v1', 'daystar-shell-' + version)
      this.emitFile({ type: 'asset', fileName: 'notifications-sw.js', source: worker })
      this.emitFile({ type: 'asset', fileName: 'offline-assets.json', source: JSON.stringify([...assets, '/daystar.svg', '/daystar-192.png', '/daystar-512.png', '/manifest.webmanifest']) })
    },
  }],
})

export default config
