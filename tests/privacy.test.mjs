import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('privacy identifies the controller, independent analytics and visitor rights', () => {
  const html = fs.readFileSync('dist/privacy/index.html', 'utf8');
  const content = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  for (const heading of [
    'Controller and contact details',
    'Analytics used on this site',
    'Cloudflare Web Analytics',
    'Optional Google Analytics',
    'What Google Analytics measures',
    'Your Google Analytics choice',
    'Retention and recipients',
    'Your rights',
  ])
    assert.ok(content.includes(heading), `Missing privacy section: ${heading}`);
  assert.ok(content.includes('mailto:hello@adrianrusu.dev'));
  assert.ok(content.includes('Google Analytics settings'));
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.ok(text.includes('Where applicable'));
  assert.ok(text.includes('withdraw consent'));
  assert.ok(text.includes('For privacy requests'));
  assert.ok(text.includes('right to lodge a complaint'));
  assert.match(
    content,
    /<a\b[^>]*href="https:\/\/www\.dataprotection\.ro\/\?lang=ro(?:&amp;|&)page=Plangeri_meniu"[^>]*>\s*data-protection supervisory(?:\s|&nbsp;|&#160;)authority\s*<\/a>/,
  );
  assert.ok(!text.includes('You may also complain to a competent data-protection authority'));
  assert.ok(!content.includes('Email links open your email application.'));
  assert.ok(!content.includes('Fonts and external links'));
  assert.ok(!content.includes('ar_analytics_consent'));
});
