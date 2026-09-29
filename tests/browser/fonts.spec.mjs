import { test, expect } from '@playwright/test';

test('local font faces load without Google Fonts requests and preserve intermediate weights', async ({
  page,
  context,
}) => {
  const requests = [];
  const fontResponses = [];
  context.on('request', (request) => requests.push(request.url()));
  page.on('response', (response) => {
    if (response.url().includes('/fonts/'))
      fontResponses.push({ url: response.url(), status: response.status() });
  });
  await context.route('https://static.cloudflareinsights.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await context.route('https://cloudflareinsights.com/**', (route) =>
    route.fulfill({ status: 204 }),
  );
  for (const route of ['/', '/projects/', '/projects/pandawave/', '/privacy/']) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('script[data-cf-beacon]')).toHaveCount(1);
  }
  const loaded = await page.evaluate(async () => {
    const faces = [];
    for (const [family, weights] of [
      ['DM Sans', [400, 450, 500, 550, 600, 650, 700]],
      ['IBM Plex Mono', [400]],
    ]) {
      for (const weight of weights) {
        const result = await document.fonts.load(`${weight} 20px "${family}"`, 'Résumé Aa 0123');
        faces.push({ family, weight, loaded: result.some((font) => font.status === 'loaded') });
      }
    }
    return faces;
  });
  expect(loaded).toHaveLength(8);
  expect(loaded.every((face) => face.loaded)).toBe(true);
  expect(requests.filter((url) => /fonts\.(googleapis|gstatic)\.com/.test(url))).toEqual([]);
  expect(requests.filter((url) => /googletagmanager|google-analytics/.test(url))).toEqual([]);
  expect(fontResponses.length).toBeGreaterThanOrEqual(2);
  expect(
    fontResponses.every(
      (response) =>
        new URL(response.url).origin === 'http://127.0.0.1:4175' && response.status === 200,
    ),
  ).toBe(true);
});
