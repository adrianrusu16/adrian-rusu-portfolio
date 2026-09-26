import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const pages = [
  'index.html',
  'projects/index.html',
  'projects/pandawave/index.html',
  'projects/canopy/index.html',
  'projects/canopy-api/index.html',
  'projects/cpp-mastery/index.html',
  'experience/index.html',
  'about/index.html',
  'resume/index.html',
  '404.html',
];
test('all requested routes have distinct titles, metadata and one primary heading', () => {
  const titles = new Set();
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, page);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title, page);
    assert.ok(!titles.has(title), `duplicate title: ${title}`);
    titles.add(title);
    assert.match(html, /name="description"/);
    assert.match(html, /<html lang="en"/);
    assert.match(html, /Skip to content/);
    assert.match(html, /id="main"/);
  }
});
test('every internal link and local asset resolves, including section anchors', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
      const target = match[1];
      if (!target.startsWith('/') && !target.startsWith('#')) continue;
      const [pathname, fragment] = target.split('#');
      const file = pathname
        ? path.join(root, pathname, pathname.endsWith('/') ? 'index.html' : '')
        : path.join(root, page);
      assert.ok(fs.existsSync(file), `${page}: missing ${target}`);
      if (fragment)
        assert.ok(
          fs.readFileSync(file, 'utf8').includes(`id="${fragment}"`),
          `${page}: missing anchor ${target}`,
        );
    }
  }
});
test('résumé download is a real PDF, and metadata assets are present', () => {
  assert.equal(
    fs.readFileSync(path.join(root, 'adrian-rusu-resume.pdf')).subarray(0, 5).toString(),
    '%PDF-',
  );
  for (const file of [
    'robots.txt',
    'sitemap.xml',
    'favicon.svg',
    'site.webmanifest',
    'images/cockpit-hero.webp',
    'images/social-card.png',
  ])
    assert.ok(fs.statSync(path.join(root, file)).size > 0, file);
  assert.match(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), /projects\/pandawave\//);
});

test('case studies have complete social images and unique IDs', () => {
  for (const slug of ['pandawave', 'canopy', 'canopy-api', 'cpp-mastery']) {
    const html = fs.readFileSync(path.join(root, 'projects', slug, 'index.html'), 'utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(ids.length, new Set(ids).size, `${slug}: duplicate IDs`);
    assert.equal((html.match(/id="case-sections"/g) || []).length, 1);
    const social = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    assert.ok(social, `${slug}: missing social image`);
    assert.ok(fs.existsSync(path.join(root, new URL(social).pathname)));
  }
});

test('public source links and external-link protections survive content rendering', () => {
  for (const [slug, repo] of [
    ['pandawave', 'Media-App'],
    ['canopy', 'Canopy'],
    ['cpp-mastery', 'cpp-mastery'],
    ['canopy-api', 'canopy-api'],
  ]) {
    const html = fs.readFileSync(path.join(root, 'projects', slug, 'index.html'), 'utf8');
    assert.ok(html.includes(`href="https://github.com/adrianrusu16/${repo}"`));
    for (const match of html.matchAll(/<a\b[^>]*href="https:\/\/[^>]+>/g)) {
      assert.match(match[0], /target="_blank"/);
      assert.match(match[0], /rel="noopener noreferrer"/);
    }
  }
});
