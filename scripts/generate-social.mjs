import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
const requireFromAstro = createRequire(import.meta.resolve('astro'));
const sharp = requireFromAstro('sharp');
const projects = [
  ['pandawave', 'PandaWave', 'AAOS media platform', 'pandawave/home.webp'],
  ['canopy', 'Canopy', 'Rust media backend', 'diagrams/canopy.svg'],
  ['canopy-api', 'canopy-api', 'Versioned API contract', 'diagrams/canopy-api.svg'],
  ['cpp-mastery', 'C++ Mastery', 'Systems learning lab', 'diagrams/vector.svg'],
];
for (const [slug, title, label, file] of projects) {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#0b0e13"/><text x="48" y="58" font-family="DejaVu Sans" font-size="18" fill="#abb6c7">ADRIAN RUSU / ${label.toUpperCase()}</text><path d="M48 135H88" stroke="#c97f99" stroke-width="3"/><text x="48" y="214" font-family="DejaVu Sans" font-size="49" fill="#f1f2f5">${title}</text><text x="48" y="270" font-family="DejaVu Sans" font-size="22" fill="#9aafc8">${label}</text><text x="48" y="540" font-family="DejaVu Sans" font-size="17" fill="#df9fb4">Engineering beyond the screen.</text><path d="M48 583H1152" stroke="#343b48"/></svg>`;
  const visual = await sharp(await fs.readFile(`public/images/${file}`))
    .resize({ width: 680, height: 420, fit: 'contain', background: '#0b0e13' })
    .png()
    .toBuffer();
  await sharp(Buffer.from(svg))
    .composite([{ input: visual, left: 475, top: 112 }])
    .png()
    .toFile(`public/images/og-${slug}.png`);
}
console.log('Created four social cards from primary project visuals.');
