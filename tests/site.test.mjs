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
  'privacy/index.html',
  'notes/index.html',
  'notes/aaos-rotary-dpad-focus/index.html',
  'notes/android-jank-perfetto-atrace/index.html',
  'notes/aaos-mediasession-mediabrowser/index.html',
  '404.html',
];

test('the public build excludes editor lock files', () => {
  const files = fs.readdirSync(root, { recursive: true });
  const editorFiles = files.filter((file) => path.basename(file).startsWith('~$'));
  assert.deepEqual(editorFiles, []);
});

function schemaEntities(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(
    ([, json]) => {
      const schema = JSON.parse(json);
      return schema['@graph'] ?? [schema];
    },
  );
}

test('profile identity connects the full name, public brand and exact professional profiles', () => {
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const about = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
  for (const html of [home, about]) {
    const person = schemaEntities(html).find((entity) => entity['@type'] === 'Person');
    assert.equal(person?.name, 'Adrian-Leontin Rusu');
    assert.equal(person?.alternateName, 'Adrian Rusu');
    assert.deepEqual(person?.sameAs, [
      'https://www.linkedin.com/in/adrian-leontin-rusu/',
      'https://github.com/adrianrusu16',
    ]);
  }
  const profile = schemaEntities(about).find((entity) => entity['@type'] === 'ProfilePage');
  assert.equal(profile?.url, 'https://adrianrusu.dev/about/');
  assert.equal(profile?.mainEntity?.['@id'], 'https://adrianrusu.dev/#person');
  assert.ok(/rel="canonical" href="https:\/\/adrianrusu.dev\/about\/"/.test(about));
  const caption = about.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1];
  assert.ok(caption?.trim().startsWith('Adrian-Leontin Rusu'));
  assert.ok(/<title>Adrian-Leontin Rusu — Senior Android \/ AAOS Engineer<\/title>/.test(about));
  assert.ok(/<title>Adrian Rusu — Android Automotive Engineer<\/title>/.test(home));
});

test('production experience identifies the employer and keeps client work generic', () => {
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const card = home.match(/<div class="experience-preview">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(card);
  const employer = card.match(/<span class="eyebrow">([^<]+)<\/span>/)?.[1];
  assert.equal(employer, 'ASCENTCORE');
  assert.match(card, /Automotive media HMI/);
  for (const theme of ['Media', 'Automotive', 'Performance', 'Feature ownership'])
    assert.ok(card.includes(theme));

  const experience = fs.readFileSync(path.join(root, 'experience/index.html'), 'utf8');
  const currentRole = experience.match(/<article class="career-entry">([\s\S]*?)<\/article>/)?.[1];
  assert.ok(currentRole);
  assert.match(currentRole, /<span class="company-label">AscentCore<\/span>/);
  assert.match(currentRole, /Production automotive media HMI/);
  assert.doesNotMatch(currentRole, /Client\s*:/i);
  const description = experience.match(/name="description" content="([^"]+)"/)?.[1];
  assert.equal(
    description,
    'Production Android Automotive media experience at AscentCore, preceded by Android development at Endava.',
  );
  for (const theme of ['MediaSession', 'Steering-wheel controls', 'Perfetto', 'Feature ownership'])
    assert.ok(currentRole.includes(theme));

  const resume = fs.readFileSync(path.join(root, 'resume/index.html'), 'utf8');
  const heading = resume.match(/<h2>Current role<\/h2>[\s\S]*?<h3>([^<]+)<\/h3>/)?.[1];
  assert.equal(heading, 'AscentCore');
  assert.match(resume, /Aug 2023 — Present · Senior Android Developer/);
});

test('indexable pages connect their canonical URL, identity and page schema', () => {
  const descriptions = new Set();
  for (const page of pages.filter((p) => p !== '404.html')) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const canonical = `https://adrianrusu.dev/${page.replace(/index\.html$/, '')}`;
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`), page);
    assert.doesNotMatch(html, /name="robots" content="[^"]*noindex/);
    const description = html.match(/name="description" content="([^"]+)"/)?.[1];
    assert.ok(description && !descriptions.has(description), page);
    descriptions.add(description);
    const entities = schemaEntities(html);
    const person = entities.find((entity) => entity['@type'] === 'Person');
    const website = entities.find((entity) => entity['@type'] === 'WebSite');
    const webPage = entities.find((entity) => entity['@id'] === `${canonical}#webpage`);
    assert.equal(person?.['@id'], 'https://adrianrusu.dev/#person');
    assert.equal(website?.publisher?.['@id'], person['@id']);
    assert.equal(webPage?.url, canonical);
    assert.equal(webPage?.isPartOf?.['@id'], website['@id']);
  }
});

test('project schema describes public source code and the visible breadcrumb trail', () => {
  for (const slug of ['pandawave', 'canopy', 'canopy-api', 'cpp-mastery']) {
    const html = fs.readFileSync(path.join(root, 'projects', slug, 'index.html'), 'utf8');
    const entities = schemaEntities(html);
    const source = entities.find((entity) => entity['@type'] === 'SoftwareSourceCode');
    const article = entities.find((entity) => entity['@type'] === 'TechArticle');
    const breadcrumb = entities.find((entity) => entity['@type'] === 'BreadcrumbList');
    assert.ok(source?.codeRepository?.startsWith('https://github.com/adrianrusu16/'), slug);
    assert.ok(html.includes(`href="${source.codeRepository}"`), slug);
    assert.equal(article?.about?.['@id'], source['@id']);
    assert.equal(article?.author?.['@id'], 'https://adrianrusu.dev/#person');
    assert.deepEqual(
      breadcrumb?.itemListElement.map((item) => item.position),
      [1, 2],
    );
    assert.equal(breadcrumb.itemListElement[0].item, 'https://adrianrusu.dev/projects/');
    assert.equal(breadcrumb.itemListElement[1].item, `https://adrianrusu.dev/projects/${slug}/`);
  }
});

test('404 stays out of search and sitemap contains exactly the indexable pages', () => {
  const html = fs.readFileSync(path.join(root, '404.html'), 'utf8');
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.equal(schemaEntities(html).length, 0);
  const urls = [
    ...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  assert.deepEqual(
    urls.sort(),
    pages
      .filter((p) => p !== '404.html')
      .map((p) => `https://adrianrusu.dev/${p.replace(/index\.html$/, '')}`)
      .sort(),
  );
});
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
    ['pandawave', 'PandaWave'],
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
