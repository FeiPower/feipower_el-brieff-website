/**
 * Regenerates responsive AVIF/WebP variants for the web-hero cut-out.
 * Source of truth: public/arturo-cover-cut-out.png
 *
 * Flood-fills the studio plate from the edges to true alpha so Arturo sits
 * on the hero's solid --primary without a second rectangular background,
 * encoder grain in the plate, or a visible copy/media seam.
 *
 * Usage: node scripts/optimize-hero-image.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'public', 'arturo-cover-cut-out.png');
const OUT_DIR = path.join(ROOT, 'public', 'hero');
const BASE = 'arturo-cover-cut-out';
const WIDTHS = [480, 768, 1024];

/** tokens.css --primary */
const PRIMARY = { r: 0x12, g: 0x1c, b: 0x16 };
/**
 * Match the plated / carbón plate only. Do not key generic near-black —
 * that would flood into Arturo’s shirt and hair from the plate edge.
 */
const PLATE_TOL = 3;

function isPlatePixel(r, g, b) {
  return (
    Math.abs(r - PRIMARY.r) <= PLATE_TOL &&
    Math.abs(g - PRIMARY.g) <= PLATE_TOL &&
    Math.abs(b - PRIMARY.b) <= PLATE_TOL
  );
}

/**
 * Edge flood-fill: plate → alpha 0. Subject (incl. dark hair/shirt that is
 * not edge-connected plate) stays opaque.
 */
async function loadTransparentCutout() {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.from(data);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryEnqueue = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * channels;
    if (!isPlatePixel(out[i], out[i + 1], out[i + 2])) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx / width) | 0;
    const i = idx * channels;
    out[i] = PRIMARY.r;
    out[i + 1] = PRIMARY.g;
    out[i + 2] = PRIMARY.b;
    out[i + 3] = 0;

    if (x > 0) tryEnqueue(x - 1, y);
    if (x + 1 < width) tryEnqueue(x + 1, y);
    if (y > 0) tryEnqueue(x, y - 1);
    if (y + 1 < height) tryEnqueue(x, y + 1);
  }

  return sharp(out, {
    raw: {
      width,
      height,
      channels,
    },
  });
}

async function writeVariant(pipeline, width, ext, encode) {
  const file = path.join(OUT_DIR, `${BASE}-${width}.${ext}`);
  await encode(
    pipeline.clone().resize(width, width, {
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

  const cutout = await loadTransparentCutout();
  // Persist the alpha master so the PNG fallback matches AVIF/WebP.
  await cutout.clone().png().toFile(SOURCE);

  const report = [];
  for (const width of WIDTHS) {
    report.push(
      await writeVariant(cutout, width, 'avif', (img) =>
        img.avif({ quality: 82, effort: 7 }),
      ),
    );
    report.push(
      await writeVariant(cutout, width, 'webp', (img) =>
        img.webp({ quality: 90, effort: 6, alphaQuality: 100 }),
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
