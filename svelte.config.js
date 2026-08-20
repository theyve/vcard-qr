import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true,
    }),
    prerender: {
      entries: ['*', '/404'],
    },
    // Domain-root deploy: absolute asset URLs so /de/ does not request ./sw.js as /de/sw.js.
    paths: {
      relative: false,
    },
    serviceWorker: {
      register: false,
    },
  },
};

export default config;
