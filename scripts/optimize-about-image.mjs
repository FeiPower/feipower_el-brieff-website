/**
 * Regenerates responsive AVIF/WebP variants for the about-page host portrait.
 * Source of truth: public/arturo-about-us.png
 *
 * Usage: node scripts/optimize-about-image.mjs
 *
 * Display constraint: .about-host__portrait max-width 16rem (~256 CSS px).
 * Widths cover 1x–2.5x DPR without upscaling past the source.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'public', 'arturo-about-us.png');
const OUT_DIR = path.join(ROOT, 'public', 'about');
const BASE = 'arturo-about-us';
const WIDTHS = [320, 480, 640];

async function writeVariant(width, ext, encode) {
  const file = path.join(OUT_DIR, `${BASE}-${width}.${ext}`);
  await encode(
    sharp(SOURCE).resize(width, null, {
      fit: 'inside',
      withoutEnlargement: true,
    }),
  ).toFile(file);
  const { size } = await fs.stat(file);
  return { file: path.relative(ROOT, file), bytes: size };
}

async function main() {
  await fs.access(SOURCE);
  await fs.mkdir(OUT_DIR, { recursive: true });

  const meta = await sharp(SOURCE).metadata();
  console.log(`source ${meta.width}×${meta.height} ${meta.format}`);

  const report = [];
  for (const width of WIDTHS) {
    report.push(
      await writeVariant(width, 'avif', (img) =>
        img.avif({ quality: 55, effort: 6 }),
      ),
    );
    report.push(
      await writeVariant(width, 'webp', (img) =>
        img.webp({ quality: 78, effort: 6 }),
      ),
    );
  }

  for (const row of report) {
    console.log(`${row.file}  ${(row.bytes / 1024).toFixed(1)} KB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
