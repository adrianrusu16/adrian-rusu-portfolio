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
  assert.ok(!content.includes('Email links open your email application.'));
  assert.ok(!content.includes('Fonts and external links'));
  assert.ok(!content.includes('ar_analytics_consent'));
});
