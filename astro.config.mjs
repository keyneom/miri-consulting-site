import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.miri-consulting.com',
  trailingSlash: 'ignore',
  build: {
    format: 'file',
    assets: '_assets',
  },
  integrations: [sitemap()],
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});
