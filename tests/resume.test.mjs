import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

test('the built résumé is the verified two-page domain-email export at its stable path', () => {
  const source = fs.readFileSync('public/adrian-rusu-resume.pdf');
  const built = fs.readFileSync('dist/adrian-rusu-resume.pdf');
  // This fingerprint identifies the owner-supplied export checked for text,
  // annotations and layout; revalidate replacement PDFs before updating it.
  assert.equal(
    createHash('sha256').update(source).digest('hex'),
    'e33e124e13173610619bd996e1a92b9c22b61cff0250572a24dc2f9218e9d17b',
  );
  assert.deepEqual(built, source);
  const html = fs.readFileSync('dist/resume/index.html', 'utf8');
  assert.match(html, /href="\/adrian-rusu-resume\.pdf"[^>]*download/);
  assert.match(html, /href="\/adrian-rusu-resume\.pdf"[^>]*target="_blank"/);
});
