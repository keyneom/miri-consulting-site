/**
 * Prefixes Astro `base` onto a root-absolute path so static files resolve on
 * GitHub Pages project sites (`https://user.github.io/repo/`).
 */
export function rootPath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.BASE_URL;
  if (base === '/') {
    return normalized;
  }
  return `${base.replace(/\/$/, '')}${normalized}`;
}
