import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const home = await readFile(path.join(root, 'baseline', 'home.html'), 'utf8');
const footerStart = home.indexOf('<footer class="footer7_component">');
const footerEnd = home.indexOf('</footer>', footerStart) + '</footer>'.length;
if (footerStart === -1 || footerEnd === -1) {
  throw new Error('Footer block not found in baseline/home.html');
}
const footer = home.slice(footerStart, footerEnd);
await mkdir(path.join(root, 'src', 'partials'), { recursive: true });
await writeFile(path.join(root, 'src', 'partials', 'footer.html'), footer, 'utf8');
console.log('Wrote src/partials/footer.html');
