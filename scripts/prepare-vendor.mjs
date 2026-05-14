import { cp, link, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const webflowRoot = path.join(
  root,
  'cdn.prod.website-files.com/64f363b4ba0fc1362362824f',
);
const vendorRoot = path.join(root, 'public/vendor');

await mkdir(path.join(vendorRoot, 'webflow/css'), { recursive: true });
await mkdir(path.join(vendorRoot, 'webflow/js'), { recursive: true });
await mkdir(path.join(vendorRoot, 'webflow/assets'), { recursive: true });
await mkdir(path.join(vendorRoot, 'webfont'), { recursive: true });
await mkdir(path.join(vendorRoot, 'jquery'), { recursive: true });
await mkdir(path.join(vendorRoot, 'cookieyes'), { recursive: true });
await mkdir(path.join(vendorRoot, 'finsweet'), { recursive: true });
await mkdir(path.join(vendorRoot, 'tags/first-party'), { recursive: true });

await cp(path.join(webflowRoot, 'css'), path.join(vendorRoot, 'webflow/css'), {
  recursive: true,
});
await cp(path.join(webflowRoot, 'js'), path.join(vendorRoot, 'webflow/js'), {
  recursive: true,
});

const assetEntries = await readdir(webflowRoot);
for (const entry of assetEntries) {
  if (entry === 'css' || entry === 'js') continue;
  await cp(path.join(webflowRoot, entry), path.join(vendorRoot, 'webflow/assets', entry));
}

const assetDir = path.join(vendorRoot, 'webflow/assets');

function webflowEncodedName(entry) {
  return entry
    .replaceAll(' ', '%20')
    .replaceAll('`', '%60')
    .replaceAll(':', '%3A')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29')
    .replaceAll('@', '%40');
}

async function ensureAssetAlias(source, alias) {
  if (alias === source) return;
  try {
    await link(path.join(assetDir, source), path.join(assetDir, alias));
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

for (const entry of await readdir(assetDir)) {
  if (entry.includes('%')) continue;
  await ensureAssetAlias(entry, entry.replaceAll(' ', '%20').replaceAll('@', '%40'));
  await ensureAssetAlias(entry, webflowEncodedName(entry));
}

await cp(
  path.join(root, 'ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'),
  path.join(vendorRoot, 'webfont/webfont.js'),
);
await cp(
  path.join(
    root,
    'd3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=64f363b4ba0fc1362362824f',
  ),
  path.join(vendorRoot, 'jquery/jquery-3.5.1.min.js'),
);
await cp(
  path.join(
    root,
    'cdn-cookieyes.com/client_data/a9444bde0e91feb16b7f6557/script.js',
  ),
  path.join(vendorRoot, 'cookieyes/script.js'),
);
await cp(
  path.join(root, 'cdn.jsdelivr.net/npm/@finsweet/attributes-modal@1/modal.js'),
  path.join(vendorRoot, 'finsweet/modal.js'),
);
await cp(
  path.join(
    root,
    'cdn.prod.website-files.com/64f363b4ba0fc1362362824f%2F652d31f3dc22d7b4ee708e44%2F67cf7e497e5209310062b97c%2Fclarity_script-1.4.7.js',
  ),
  path.join(vendorRoot, 'tags/clarity_script-1.4.7.js'),
);
await cp(
  path.join(
    root,
    'cdn.prod.website-files.com/64f363b4ba0fc1362362824f%2F66ba5a08efe71070f98dd10a%2F67cf65c4e96f6939f5bc9bfd%2Fn3phmjqq-1.1.1.js',
  ),
  path.join(vendorRoot, 'tags/n3phmjqq-1.1.1.js'),
);
await cp(
  path.join(
    root,
    'haqt6iy0yx2eNjRmMzYzYjRiYTBmYzEzNjIzNjI4MjRm/tvAAsIKEswP0uufI_5zRB4CSZhM',
  ),
  path.join(vendorRoot, 'tags/first-party/tvAAsIKEswP0uufI_5zRB4CSZhM'),
);

await cp(
  path.join(root, 'miri-static-overrides.js'),
  path.join(root, 'public/miri-static-overrides.js'),
);

const teamAssets = path.join(root, 'src/assets/team');
try {
  await stat(teamAssets);
  await cp(teamAssets, path.join(root, 'public/assets/team'), { recursive: true });
} catch {
  // optional team headshots
}

const testimonialAssets = path.join(root, 'src/assets/testimonials');
try {
  await stat(testimonialAssets);
  await cp(testimonialAssets, path.join(root, 'public/assets/testimonials'), {
    recursive: true,
  });
} catch {
  // optional testimonial portraits
}

console.log('Vendor tree prepared under public/vendor');
