import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL ?? 'https://www.miri-consulting.com';
const VIEWPORTS = [
  { name: '375', width: 375, height: 800 },
  { name: '640', width: 640, height: 480 },
  { name: '768', width: 768, height: 1024 },
  { name: '991', width: 991, height: 1280 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'privacy', path: '/privacy-policy.html' },
  { name: 'terms', path: '/terms-of-service.html' },
];

const root = process.cwd();
const screenshotDir = path.join(root, 'baseline', 'screenshots');
const domDir = path.join(root, 'baseline', 'dom');

await mkdir(screenshotDir, { recursive: true });
await mkdir(domDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext();

for (const pageInfo of PAGES) {
  const page = await context.newPage();
  await page.goto(new URL(pageInfo.path, BASE_URL).toString(), {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);

  const html = await page.evaluate(() => document.documentElement.outerHTML);
  await writeFile(path.join(domDir, `${pageInfo.name}.html`), html, 'utf8');

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    const spline = page.locator('.spline-scene');
    const mask = (await spline.count()) > 0 ? [spline] : [];
    await page.screenshot({
      path: path.join(screenshotDir, `${pageInfo.name}-${viewport.name}.png`),
      fullPage: true,
      mask,
    });
  }

  await page.close();
}

await browser.close();
console.log('Baseline capture complete.');
