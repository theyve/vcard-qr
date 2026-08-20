import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // DDEV's traefik router already binds 127.0.0.1:5173 (and 5172/5175).
    // If we keep Vite's default, it silently listens on [::1]:5173 only, and
    // http://localhost:5173/ hits DDEV's "404 page not found".
    host: '127.0.0.1',
    port: 5180,
    strictPort: true,
  },
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      base: '/',
      scope: '/',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png',
        'og.png',
      ],
      manifest: {
        name: 'vCard QR Code Generator',
        short_name: 'vCard QR',
        description: 'vCard QR code for a printed business card. Contact details stay in your browser.',
        theme_color: '#f9cb15',
        background_color: '#faf8f3',
        display: 'standalone',
        // Open the German generator directly; `/` is a Netlify 302 that the SW must not cache.
        start_url: '/de/',
        scope: '/',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        // Multipage static site: skip SPA NavigationRoute so `/` hits Netlify's 302 → /de/.
        navigateFallback: '',
        // Prefixes matter: @vite-pwa/sveltekit otherwise auto-adds prerendered/**/*.html.
        globPatterns: ['client/**/*.{js,css,svg,png,ico,webmanifest}'],
        // Never precache HTML — cached `/` would skip the locale redirect.
        globIgnores: ['prerendered/**'],
      },
      kit: {
        includeVersionFile: true,
        trailingSlash: 'always',
      },
    }),
  ],
});
