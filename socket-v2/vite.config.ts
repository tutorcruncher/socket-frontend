import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'
import { resolve } from 'node:path'

// The widget is shipped as a single self-contained `socket.js` IIFE bundle that
// customers drop onto their own pages. CSS is injected into the JS so there is
// only ever one file to include. `npm run dev` serves the demo page in index.html.
export default defineConfig(({ command }) => ({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  plugins: [
    react(),
    tailwindcss(),
    // Inline the compiled CSS into the JS bundle so embeds need one <script> only.
    cssInjectedByJs(),
  ],
  // Dev-only proxy: the socket API enforces an Origin allow-list, so a browser at
  // localhost is rejected (403). We forward `/socket-api/*` to the real API and strip
  // the Origin/Referer headers server-side (a no-Origin request is allowed). The demo
  // points api_root at `/socket-api` so the widget talks to this same-origin proxy.
  server: {
    proxy: {
      '/socket-api': {
        target: 'https://socket.tutorcruncher.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/socket-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('referer')
          })
        },
      },
    },
  },
  // Library build only applies to `vite build`; `vite dev` uses index.html.
  build:
    command === 'build'
      ? {
          lib: {
            entry: resolve(__dirname, 'src/embed.tsx'),
            name: 'TutorCruncherSocket',
            formats: ['iife'],
            fileName: () => 'socket.js',
          },
          rollupOptions: {
            output: {
              // No external deps — everything is bundled for a drop-in widget.
              extend: true,
            },
          },
          target: 'es2019',
        }
      : undefined,
}))
