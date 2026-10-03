import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const read = (page) => fs.readFileSync(path.join('dist', page, 'index.html'), 'utf8');

test('Notes discovery connects navigation, Home, About, performance and public projects', () => {
  const home = read('');
  for (const label of ['Main navigation', 'Mobile navigation']) {
    const navigation = [...home.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/g)].find(([nav]) =>
      nav.includes(`aria-label="${label}"`),
    )?.[0];
    assert.ok(navigation?.includes('href="/notes/"'), `Notes missing from ${label}`);
  }
  const teaser = home.match(/<section[^>]*id="engineering-notes"[\s\S]*?<\/section>/)?.[0];
  assert.ok(teaser, 'Home lacks Engineering Notes teaser');
  assert.ok(home.indexOf('id="selected-work"') < home.indexOf('id="engineering-notes"'));
  assert.equal((teaser.match(/class="note-card"/g) ?? []).length, 3);
  assert.ok(read('about').includes('href="/notes/"'));
  assert.ok(read('experience').includes('href="/notes/android-jank-perfetto-atrace/"'));
  const related = read('projects/pandawave').match(
    /<nav[^>]*aria-label="Related engineering notes"[\s\S]*?<\/nav>/,
  )?.[0];
  assert.ok(related, 'PandaWave lacks related engineering notes');
  for (const slug of [
    'aaos-rotary-dpad-focus',
    'android-jank-perfetto-atrace',
    'aaos-mediasession-mediabrowser',
  ])
    assert.ok(related.includes(`href="/notes/${slug}/"`), slug);
  assert.ok(read('projects/canopy-api').includes('href="/notes/aaos-mediasession-mediabrowser/"'));
});
