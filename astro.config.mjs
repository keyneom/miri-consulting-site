import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Trailing slash required by Astro when not '/'. */
function normalizeBase(raw) {
  if (!raw || raw === '/') return '/';
  let b = String(raw).trim();
  if (!b.startsWith('/')) b = `/${b}`;
  if (!b.endsWith('/')) b += '/';
  return b;
}

const base = normalizeBase(process.env.ASTRO_BASE);
const site =
  process.env.ASTRO_SITE_URL?.trim() || 'https://www.miri-consulting.com';

export default defineConfig({
  site,
  base,
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
