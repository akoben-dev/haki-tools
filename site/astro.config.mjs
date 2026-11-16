// Astro config: static output only. Every page is real HTML at build time,
// so content and forms work without JavaScript or WebGL.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://haki.tools',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // /rvrmmo/privacy is a static file in public/, so list it explicitly.
      customPages: ['https://haki.tools/rvrmmo/privacy/'],
      // Keep utility pages out of search results.
      filter: (page) => !/\/contact\/(thanks|error)\/?$/.test(page) && !/\/404\/?$/.test(page),
    }),
  ],
  // three.js (~130 KB gzipped) is lazy-loaded after first paint, so its size is expected.
  vite: { build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 600 } },
});
