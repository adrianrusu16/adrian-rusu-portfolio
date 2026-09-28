import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}
test('each HTML document has one standard manual Cloudflare beacon', () => {
  const pages = htmlFiles('dist');
  assert.ok(pages.length > 0);
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map((match) => match[0]);
    const beacons = scripts.filter((script) =>
      /data-cf-beacon|cloudflareinsights\.com/i.test(script),
    );
    assert.equal(beacons.length, 1, 'Each page must contain exactly one Cloudflare beacon');
    const script = beacons[0];
    assert.ok(
      script.includes('src="https://static.cloudflareinsights.com/beacon.min.js"'),
      'Standard beacon source is required',
    );
    assert.match(script, /\bdefer\b/);
    const raw = script.match(/data-cf-beacon=(["'])(.*?)\1/)?.[2];
    assert.ok(raw, 'Beacon configuration must be present');
    let valid = false;
    try {
      const config = JSON.parse(
        raw.replaceAll('&quot;', '"').replaceAll('&#34;', '"').replaceAll('&amp;', '&'),
      );
      valid = typeof config.token === 'string' && config.token.length > 0;
    } catch {
      /* Keep public token values out of assertion output. */
    }
    assert.ok(valid, 'Beacon configuration must contain the existing public site token');
    assert.ok(
      !scripts.some((s) => /src=["'][^"']*googletagmanager\.com/i.test(s)),
      'GA4 must remain dynamically consent-gated',
    );
  }
});
