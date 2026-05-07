/* eslint-disable no-console */
/**
 * Render a static mock-up of the Google Wallet card with our hero image,
 * approximating how it looks when the user opens the pass on their phone.
 * Output: public/wallet/mockup.png (not deployed; preview only).
 */
import { fileURLToPath } from 'url';
import path from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');

// Phone-view-ish proportions. Card width ~ 480 px, mock includes phone padding.
const CARD_W = 480;
const PAD = 24;
const W = CARD_W + PAD * 2;
const HERO_W = CARD_W;
const HERO_H = Math.round(HERO_W / (1032 / 336)); // ~156

const HEADER_H = 64;
const LOYALTY_H = 130;
const QR_H = 200;
const ABOUT_H = 210;
const CARD_H = HEADER_H + HERO_H + LOYALTY_H + QR_H + ABOUT_H;
const H = CARD_H + PAD * 2;

const BLUE = '#4866B0';
const BLUE_DARK = '#1F3B81';
const YELLOW = '#FBAD18';
const PHONE_BG = '#EEF0F4';

async function main(): Promise<void> {
  // Phone background.
  const phoneBg = await sharp({
    create: { width: W, height: H, channels: 4, background: PHONE_BG },
  })
    .png()
    .toBuffer();

  // Hero from disk.
  const hero = await sharp(path.join(ROOT, 'public/wallet/hero-1032x336.png'))
    .resize(HERO_W, HERO_H)
    .png()
    .toBuffer();

  // Logo from disk (small, for the header strip).
  const logo = await sharp(path.join(ROOT, 'public/wallet/logo-660.png'))
    .resize(40, 40)
    .png()
    .toBuffer();

  // Card background (white, to be the canvas for sections).
  const cardBg = await sharp({
    create: { width: CARD_W, height: CARD_H, channels: 4, background: '#FFFFFF' },
  })
    .png()
    .toBuffer();

  // Header strip (brand blue).
  const headerSvg = Buffer.from(`
    <svg width="${CARD_W}" height="${HEADER_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CARD_W}" height="${HEADER_H}" fill="${BLUE}"/>
      <text x="76" y="26" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700"
            font-size="13" fill="#FFFFFF" opacity="0.85">Gyros Heroes</text>
      <text x="76" y="46" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800"
            font-size="16" fill="#FFFFFF">Hero kartica</text>
    </svg>
  `);
  const header = await sharp(headerSvg).png().toBuffer();

  // Loyalty tier strip — the big "X / 10 Pečati" block right under the hero.
  const loyaltySvg = Buffer.from(`
    <svg width="${CARD_W}" height="${LOYALTY_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CARD_W}" height="${LOYALTY_H}" fill="#FFFFFF"/>
      <line x1="24" y1="0" x2="${CARD_W - 24}" y2="0" stroke="#E6E8ED" stroke-width="1"/>

      <text x="32" y="50" font-family="Helvetica Neue, Arial, sans-serif" font-weight="500"
            font-size="13" fill="#5F6470" letter-spacing="0.5">Pečati</text>
      <text x="32" y="100" font-family="Helvetica Neue, Arial, sans-serif" font-weight="900"
            font-size="58" fill="#1A1D24" letter-spacing="-2">9</text>

      <line x1="${CARD_W * 0.5}" y1="32" x2="${CARD_W * 0.5}" y2="100"
            stroke="#E6E8ED" stroke-width="1"/>

      <text x="${CARD_W * 0.5 + 32}" y="50" font-family="Helvetica Neue, Arial, sans-serif"
            font-weight="500" font-size="13" fill="#5F6470" letter-spacing="0.5">Cilj</text>
      <text x="${CARD_W * 0.5 + 32}" y="100" font-family="Helvetica Neue, Arial, sans-serif"
            font-weight="900" font-size="58" fill="#1A1D24" letter-spacing="-2">10</text>
    </svg>
  `);
  const loyalty = await sharp(loyaltySvg).png().toBuffer();

  // Mock QR placeholder.
  const qrSize = 140;
  const qrSvg = Buffer.from(`
    <svg width="${CARD_W}" height="${QR_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CARD_W}" height="${QR_H}" fill="#FFFFFF"/>
      <line x1="24" y1="0" x2="${CARD_W - 24}" y2="0" stroke="#E6E8ED" stroke-width="1"/>
      <g transform="translate(${(CARD_W - qrSize) / 2}, ${(QR_H - qrSize) / 2})">
        <rect width="${qrSize}" height="${qrSize}" fill="#1A1D24"/>
        ${Array.from({ length: 64 }, () => {
          const x = Math.floor(Math.random() * 14) * 10;
          const y = Math.floor(Math.random() * 14) * 10;
          return `<rect x="${x}" y="${y}" width="10" height="10" fill="#FFFFFF"/>`;
        }).join('')}
        <rect x="0" y="0" width="30" height="30" fill="#FFFFFF"/>
        <rect x="5" y="5" width="20" height="20" fill="#1A1D24"/>
        <rect x="10" y="10" width="10" height="10" fill="#FFFFFF"/>
        <rect x="${qrSize - 30}" y="0" width="30" height="30" fill="#FFFFFF"/>
        <rect x="${qrSize - 25}" y="5" width="20" height="20" fill="#1A1D24"/>
        <rect x="${qrSize - 20}" y="10" width="10" height="10" fill="#FFFFFF"/>
        <rect x="0" y="${qrSize - 30}" width="30" height="30" fill="#FFFFFF"/>
        <rect x="5" y="${qrSize - 25}" width="20" height="20" fill="#1A1D24"/>
        <rect x="10" y="${qrSize - 20}" width="10" height="10" fill="#FFFFFF"/>
      </g>
    </svg>
  `);
  const qr = await sharp(qrSvg).png().toBuffer();

  // About / text modules below the QR.
  const aboutSvg = Buffer.from(`
    <svg width="${CARD_W}" height="${ABOUT_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CARD_W}" height="${ABOUT_H}" fill="#FFFFFF"/>
      <line x1="24" y1="0" x2="${CARD_W - 24}" y2="0" stroke="#E6E8ED" stroke-width="1"/>
      <text x="24" y="34" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700"
            font-size="13" fill="#5F6470" letter-spacing="1">KAKO FUNKCIONIŠE</text>
      <text x="24" y="62" font-family="Helvetica Neue, Arial, sans-serif" font-weight="500"
            font-size="13" fill="#1A1D24">Pokaži ovu karticu pri svakoj poseti.</text>
      <text x="24" y="80" font-family="Helvetica Neue, Arial, sans-serif" font-weight="500"
            font-size="13" fill="#1A1D24">Kada sakupiš 10 pečata, sledeći gyros</text>
      <text x="24" y="98" font-family="Helvetica Neue, Arial, sans-serif" font-weight="500"
            font-size="13" fill="#1A1D24">je na nas.</text>

      <line x1="24" y1="125" x2="${CARD_W - 24}" y2="125" stroke="#E6E8ED" stroke-width="1"/>
      <text x="24" y="155" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700"
            font-size="13" fill="#5F6470" letter-spacing="1">LOKACIJE</text>
      <text x="24" y="183" font-family="Helvetica Neue, Arial, sans-serif" font-weight="500"
            font-size="13" fill="#1A1D24">Niš · Nikole Pašića 39 · Park Sv. Save</text>
      <text x="24" y="201" font-family="Helvetica Neue, Arial, sans-serif" font-weight="500"
            font-size="13" fill="#1A1D24">Novi Sad · Bul. Oslobođenja 89e</text>
    </svg>
  `);
  const about = await sharp(aboutSvg).png().toBuffer();

  // Stack the sections vertically into the card.
  const card = await sharp(cardBg)
    .composite([
      { input: header, left: 0, top: 0 },
      { input: logo, left: 16, top: (HEADER_H - 40) / 2 },
      { input: hero, left: 0, top: HEADER_H },
      { input: loyalty, left: 0, top: HEADER_H + HERO_H },
      { input: qr, left: 0, top: HEADER_H + HERO_H + LOYALTY_H },
      { input: about, left: 0, top: HEADER_H + HERO_H + LOYALTY_H + QR_H },
    ])
    .png()
    .toBuffer();

  // Round the card corners.
  const radius = 20;
  const mask = Buffer.from(
    `<svg width="${CARD_W}" height="${CARD_H}"><rect width="${CARD_W}" height="${CARD_H}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );
  const cardRounded = await sharp(card)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Soft drop shadow for the card.
  const shadowMask = Buffer.from(
    `<svg width="${CARD_W + 40}" height="${CARD_H + 40}"><rect x="20" y="24" width="${CARD_W}" height="${CARD_H}" rx="${radius}" ry="${radius}" fill="#000" fill-opacity="0.18"/></svg>`,
  );
  const shadow = await sharp(shadowMask).blur(12).png().toBuffer();

  await sharp(phoneBg)
    .composite([
      { input: shadow, left: PAD - 20, top: PAD - 20 },
      { input: cardRounded, left: PAD, top: PAD },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, 'public/wallet/mockup.png'));

  console.log('wrote public/wallet/mockup.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
