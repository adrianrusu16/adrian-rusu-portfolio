import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function pages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? pages(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

test('public HTML consistently uses the primary domain contact address', () => {
  const htmlFiles = pages('dist');
  assert.ok(htmlFiles.length > 0);
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    assert.ok(
      html.includes('mailto:hello@adrianrusu.dev'),
      'Public contact link uses domain email',
    );
    assert.ok(
      !html.includes('adrianrusu016@gmail.com'),
      'Forwarding destination is not exposed in HTML',
    );
    assert.ok(
      !/\b(?:contact|hi)@adrianrusu\.dev/.test(html),
      'Inbound aliases stay out of public HTML',
    );
  }
});
