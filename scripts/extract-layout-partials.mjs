import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function write(relativePath, content) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
  console.log(`Wrote ${relativePath} (${content.length} chars)`);
}

function extractSection(html, startMarker, endMarker, { includeEnd = false } = {}) {
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error(`Start marker not found: ${startMarker}`);
  const end = endMarker
    ? html.indexOf(endMarker, start + startMarker.length)
    : html.length;
  if (end === -1) throw new Error(`End marker not found after: ${startMarker}`);
  return html.slice(start, includeEnd ? end + endMarker.length : end);
}

const home = await readFile(path.join(root, 'baseline', 'home.html'), 'utf8');
const privacy = await readFile(path.join(root, 'baseline', 'privacy.html'), 'utf8');
const terms = await readFile(path.join(root, 'baseline', 'terms.html'), 'utf8');

const globalStart =
  home.indexOf('<div class="global-styles w-embed"><style>') +
  '<div class="global-styles w-embed"><style>'.length;
const globalEnd = home.indexOf('</style></div><main class="main-wrapper">');
await write('src/styles/inline-globals.css', home.slice(globalStart, globalEnd));

await write(
  'src/partials/navbar-home.html',
  extractSection(
    home,
    '<div data-animation="default" class="navbar2_component w-nav"',
    '<header class="section_header26">',
  ),
);

await write(
  'src/partials/legal-privacy-body.html',
  extractSection(privacy, '<header class="section_header1">', '<footer class="footer7_component">'),
);
await write(
  'src/partials/legal-terms-body.html',
  extractSection(terms, '<header class="section_header1">', '<footer class="footer7_component">'),
);

const main = extractSection(home, '<main class="main-wrapper">', '</main>');

const sections = [
  ['hero-header', '<header class="section_header26">', '<section data-w-id="b407f29b-c301-10ec-adaa-1813782e2e95" class="section_logo3 show-mobile-landscape">'],
  ['client-logo-marquee-mobile', '<section data-w-id="b407f29b-c301-10ec-adaa-1813782e2e95" class="section_logo3 show-mobile-landscape">', '<section data-w-id="becacc2e-c941-7bc8-3f05-dd0a02eef28a" class="section_logo3">'],
  ['client-logo-marquee', '<section data-w-id="becacc2e-c941-7bc8-3f05-dd0a02eef28a" class="section_logo3">', '<section class="section_layout494">'],
  ['industry-tabs', '<section class="section_layout494">', '<section class="section_testimonial23">'],
  ['testimonial-slider', '<section class="section_testimonial23">', '<section class="section_layout507">'],
  ['services-tabs', '<section class="section_layout507">', '<section class="section_team8">'],
  ['team-grid', '<section class="section_team8">', '<section id="contact" class="section_contact9">'],
  ['contact-cta', '<section id="contact" class="section_contact9">', '<footer class="footer7_component">'],
];

for (const [name, start, end] of sections) {
  await write(`src/partials/home/${name}.html`, extractSection(main, start, end));
}

await write(
  'src/partials/body-scripts-home.html',
  extractSection(home, '<script src="d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min', '</body>'),
);
