import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'src', 'print', 'media-kit.html');
const outDir = path.join(root, 'public', 'media-kit');
const outPath = path.join(outDir, 'el-brieff-media-kit.pdf');
const maxBytes = 5 * 1024 * 1024;

await access(htmlPath);

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, {
    waitUntil: 'networkidle',
  });
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
    },
  });
} finally {
  await browser.close();
}

const { size } = await import('node:fs/promises').then((fs) => fs.stat(outPath));
if (size > maxBytes) {
  console.error(
    `PDF exceeds 5MB: ${size} bytes at ${outPath}. Reduce image DPI or simplify.`,
  );
  process.exit(1);
}

console.log(`Wrote ${outPath} (${size} bytes)`);
