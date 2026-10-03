import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const slugs = [
  'aaos-rotary-dpad-focus',
  'android-jank-perfetto-atrace',
  'aaos-mediasession-mediabrowser',
];
function read(route) {
  const file = path.join(root, route, 'index.html');
  assert.ok(fs.existsSync(file), `Engineering Notes route missing: /${route}/`);
  return fs.readFileSync(file, 'utf8');
}
function entities(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(
    ([, json]) => JSON.parse(json)['@graph'] ?? [],
  );
}

test('three evidence-backed notes have canonical metadata, visible authorship and article schema', () => {
  const index = read('notes');
  assert.equal(
    entities(index).find((item) => item['@type'] === 'CollectionPage')?.url,
    'https://adrianrusu.dev/notes/',
  );
  const cards = new Set();
  for (const slug of slugs) {
    assert.ok(index.includes(`href="/notes/${slug}/"`), `Index omits ${slug}`);
    const html = read(`notes/${slug}`);
    const canonical = `https://adrianrusu.dev/notes/${slug}/`;
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`), slug);
    const article = entities(html).find((item) => item['@type'] === 'TechArticle');
    assert.equal(article?.url, canonical);
    assert.equal(article?.author?.['@id'], 'https://adrianrusu.dev/#person');
    assert.equal(article?.mainEntityOfPage?.['@id'], `${canonical}#webpage`);
    assert.equal(article?.datePublished, '2026-10-03T00:00:00.000Z');
    assert.equal(article?.dateModified, undefined);
    assert.ok(html.includes('datetime="2026-10-03T00:00:00.000Z"'), slug);
    assert.ok(html.includes('Adrian-Leontin Rusu'), slug);
    assert.ok(article?.keywords?.length >= 2, slug);
    assert.ok(article?.headline && article?.description, slug);
    assert.ok(html.includes(`property="og:image" content="${article.image}"`), slug);
    assert.ok(fs.statSync(path.join(root, new URL(article.image).pathname)).size > 0, slug);
    cards.add(article.image);
    const breadcrumb = entities(html).find((item) => item['@type'] === 'BreadcrumbList');
    assert.deepEqual(
      breadcrumb?.itemListElement.map((item) => [item.position, item.name, item.item]),
      [
        [1, 'Home', 'https://adrianrusu.dev/'],
        [2, 'Notes', 'https://adrianrusu.dev/notes/'],
        [3, article.headline, canonical],
      ],
    );
    assert.ok(
      /href="https:\/\/github.com\/adrianrusu16\/PandaWave\/blob\/[a-f0-9]{40}\//.test(html),
      `Pinned public evidence missing: ${slug}`,
    );
    assert.ok(html.includes('href="/projects/pandawave/"'), slug);
    assert.ok(/<pre\b/.test(html), `Concrete example missing: ${slug}`);
    for (const [link] of html.matchAll(/<a\b[^>]*href="https:\/\/[^>]+>/g)) {
      assert.ok(
        link.includes('target="_blank"') && link.includes('rel="noopener noreferrer"'),
        slug,
      );
    }
  }
  assert.equal(cards.size, 3);
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const route of ['notes', ...slugs.map((slug) => `notes/${slug}`)]) {
    assert.ok(sitemap.includes(`<loc>https://adrianrusu.dev/${route}/</loc>`), route);
  }
  assert.ok(!sitemap.includes('<lastmod>'));
});
