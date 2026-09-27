import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Discover the verification file without repeating its public token in code or logs.
const verificationName = /^[a-zA-Z0-9-]{8,128}\.txt$/;

test('IndexNow verification is exact plain text and ships at the site root', () => {
  const candidates = fs.readdirSync('public').filter((name) => verificationName.test(name));
  assert.equal(candidates.length, 1, 'Expected exactly one IndexNow verification file');
  const filename = candidates[0];
  let source;
  let built;
  try {
    source = fs.readFileSync(path.join('public', filename));
    built = fs.readFileSync(path.join('dist', filename));
  } catch {
    assert.fail('IndexNow verification must exist in source and built output');
  }
  assert.ok(
    source.equals(Buffer.from(filename.slice(0, -4), 'ascii')),
    'Verification content must exactly match the filename stem, without BOM or newline',
  );
  assert.ok(built.equals(source), 'Build must preserve verification bytes');
  const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
  assert.ok(!sitemap.includes(filename), 'Verification file must not appear in the sitemap');
});
