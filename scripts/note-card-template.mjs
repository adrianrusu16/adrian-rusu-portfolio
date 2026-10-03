const escape = (text) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character],
  );

export function noteCardSvg(title) {
  const lines = [];
  for (const word of title.split(/\s+/)) {
    const last = lines.length - 1;
    if (last < 0 || `${lines[last]} ${word}`.length > 33) lines.push(word);
    else lines[last] += ` ${word}`;
  }
  if (lines.length > 4) throw new Error('Notes card title exceeds the four-line template.');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0b0e13"/>
<text x="64" y="80" font-family="Arial, sans-serif" font-size="20" letter-spacing="3" fill="#e5a2b1">ENGINEERING NOTES</text>
<path d="M64 123H1136" stroke="#252a33"/>
${lines.map((line, index) => `<text x="64" y="${213 + index * 66}" font-family="Arial, sans-serif" font-size="49" fill="#f1f2f5">${escape(line)}</text>`).join('\n')}
<path d="M64 518H1136" stroke="#252a33"/>
<text x="64" y="573" font-family="Arial, sans-serif" font-size="23" fill="#959da9">Adrian Rusu</text>
<text x="1136" y="573" text-anchor="end" font-family="Arial, sans-serif" font-size="23" fill="#959da9">adrianrusu.dev</text>
</svg>`;
}
