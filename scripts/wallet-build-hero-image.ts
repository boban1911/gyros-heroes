/* eslint-disable no-console */
/**
 * Compose the Google Wallet hero image (1032x336 PNG) from the site's own
 * hero photo, applying the same brand-blue bottom fade that the live site
 * uses on its hero section. Output: public/wallet/hero-1032x336.png.
 *
 * Re-runnable; idempotent.
 */
import { fileURLToPath } from 'url';
import path from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');

const W = 1032;
const H = 336;
const BLUE = '#4866B0';

async function main(): Promise<void> {
  const src = path.join(ROOT, 'src/assets/hero-bg.webp');

  // Step 1: crop the source to the wallet's 1032x336 aspect, focused on the
  // food (which sits in the lower third of the original photo), then resize.
  // Source aspect 1.51, target 3.07 — we keep full width and crop top.
  const srcMeta = await sharp(src).metadata();
  const srcW = srcMeta.width ?? 4096;
  const srcH = srcMeta.height ?? 2713;
  const cropH = Math.round(srcW / (W / H));
  // Bias the crop downward so the gyros plate / hand stay in frame instead of
  // ceiling/empty background.
  const cropTop = Math.max(0, Math.min(srcH - cropH, Math.round(srcH * 0.32)));

  const photo = await sharp(src)
    .extract({ left: 0, top: cropTop, width: srcW, height: cropH })
    .resize(W, H)
    .png()
    .toBuffer();

  // Step 2: build the gradient overlay matching Hero.tsx:
  //   linear-gradient(180deg, rgba(72,102,176,0) 55%, rgb(72,102,176) 100%)
  // + a flat 30% black to deepen the photo and let the Wallet UI text read.
  const overlaySvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${BLUE}" stop-opacity="0"/>
          <stop offset="55%" stop-color="${BLUE}" stop-opacity="0"/>
          <stop offset="100%" stop-color="${BLUE}" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="#000" fill-opacity="0.12"/>
      <rect width="${W}" height="${H}" fill="url(#fade)"/>
    </svg>
  `);
  const overlay = await sharp(overlaySvg).png().toBuffer();

  await sharp(photo)
    .composite([{ input: overlay, blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, 'public/wallet/hero-1032x336.png'));

  console.log('wrote public/wallet/hero-1032x336.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
