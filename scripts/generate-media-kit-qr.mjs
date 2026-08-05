/**
 * Phase-3 media-kit helper (optional).
 * Not part of the CMS editorial plan package surface.
 * Requires a local `npm install qrcode` only when regenerating
 * `public/media-kit/press-hub-qr.svg`. The committed SVG is enough for PDF builds.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

let QRCode;
try {
  QRCode = require('qrcode');
} catch {
  console.error(
    'qrcode is not installed. CMS delivery does not ship qrcode; install it only for Phase-3 QR regeneration.',
  );
  process.exit(1);
}

const pressHubUrl = 'https://el-brieff.strtgy.ai/media-kit';
const outputPath = fileURLToPath(
  new URL('../public/media-kit/press-hub-qr.svg', import.meta.url),
);

await QRCode.toFile(outputPath, pressHubUrl, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 1,
  color: {
    dark: '#121C16',
    light: '#FFFFFF',
  },
});

console.log(`Wrote ${outputPath}`);
