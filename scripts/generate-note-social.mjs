import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { noteCardSvg } from './note-card-template.mjs';
const requireFromAstro = createRequire(import.meta.resolve('astro'));
const sharp = requireFromAstro('sharp');

// The Astro collection validates all metadata. Card inputs use plain, single-line strings.
for (const file of (await fs.readdir('src/content/notes')).filter((name) => /\.mdx?$/.test(name))) {
  const source = await fs.readFile(path.join('src/content/notes', file), 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  const title = frontmatter?.match(/^title: (.+)$/m)?.[1].trim();
  const image = frontmatter?.match(/^socialImage: (\/images\/og-note-[a-z0-9-]+\.png)$/m)?.[1];
  if (!title || !image) throw new Error(`Missing plain title or notes image path in ${file}`);
  await sharp(Buffer.from(noteCardSvg(title)))
    .png()
    .toFile(`public${image}`);
}
console.log('Generated the Engineering Notes social cards.');
