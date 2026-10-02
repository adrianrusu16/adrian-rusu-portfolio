import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

test('the built résumé is the verified two-page anonymized export at its stable path', () => {
  const source = fs.readFileSync('public/adrian-rusu-resume.pdf');
  const built = fs.readFileSync('dist/adrian-rusu-resume.pdf');
  // This fingerprint identifies the validated export checked for text,
  // annotations and layout; revalidate replacement PDFs before updating it.
  assert.equal(
    createHash('sha256').update(source).digest('hex'),
    '490c95618f74bd9648a46531548a8b4ec945c18c50297ffd56bf3bb0beb6115f',
  );
  assert.deepEqual(built, source);
  const html = fs.readFileSync('dist/resume/index.html', 'utf8');
  assert.match(html, /href="\/adrian-rusu-resume\.pdf"[^>]*download/);
  assert.match(html, /href="\/adrian-rusu-resume\.pdf"[^>]*target="_blank"/);
});
