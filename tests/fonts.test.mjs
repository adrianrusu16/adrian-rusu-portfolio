import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

test('built pages and styles have no remote Google Fonts dependency', () => {
  const outputs = files('dist').filter((file) => /\.(?:html|css)$/.test(file));
  assert.ok(outputs.length > 0);
  for (const file of outputs) {
    assert.ok(
      !/fonts\.(?:googleapis|gstatic)\.com/.test(fs.readFileSync(file, 'utf8')),
      'Google Fonts runtime dependency removed',
    );
  }
  const fonts = [
    'fonts/dm-sans/dm-sans-latin-wght.woff2',
    'fonts/ibm-plex-mono/ibm-plex-mono-latin-400.woff2',
  ];
  for (const font of fonts)
    assert.equal(fs.readFileSync(path.join('dist', font)).subarray(0, 4).toString(), 'wOF2');
  for (const license of ['dm-sans-OFL.txt', 'ibm-plex-mono-OFL.txt']) {
    assert.match(
      fs.readFileSync(path.join('dist/fonts/licenses', license), 'utf8'),
      /SIL OPEN FONT LICENSE/,
    );
  }
  const privacy = fs.readFileSync('dist/privacy/index.html', 'utf8');
  assert.ok(!/Google Fonts|Other third-party resources/.test(privacy));
});
