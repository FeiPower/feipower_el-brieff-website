/**
 * Regenerates responsive AVIF/WebP variants for the Spotify listen facade cover.
 * Source of truth: public/elbrieff-cover.png (canonical OG / platform cover — not rewritten).
 *
 * Usage: node scripts/optimize-cover-image.mjs
 *
 * Display: .spotify-embed__player is 352px tall; cover column ≈352 CSS px on
 * tablet+, full-bleed width on ≤540px. Source is ~500px square — no upscale.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'public', 'elbrieff-cover.png');
const OUT_DIR = path.join(ROOT, 'public', 'cover');
const BASE = 'elbrieff-cover';
const WIDTHS = [360, 500];

async function writeVariant(width, ext, encode) {
  const file = path.join(OUT_DIR, `${BASE}-${width}.${ext}`);
  await encode(
    sharp(SOURCE).resize(width, width, {
      fit: 'cover',
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
        img.avif({ quality: 65, effort: 7 }),
      ),
    );
    report.push(
      await writeVariant(width, 'webp', (img) =>
        img.webp({ quality: 82, effort: 6 }),
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
