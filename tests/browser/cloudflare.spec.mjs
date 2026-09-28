import { test, expect } from '@playwright/test';

test('one Cloudflare beacon loads independently while GA4 remains denied', async ({
  page,
  context,
}) => {
  let cloudflareLoads = 0;
  const googleRequests = [];
  context.on('request', (request) => {
    if (/googletagmanager|google-analytics/.test(request.url())) googleRequests.push(request.url());
  });
  await context.route('https://static.cloudflareinsights.com/beacon.min.js', (route) => {
    cloudflareLoads++;
    return route.fulfill({
      contentType: 'application/javascript',
      body: 'window.__cloudflareLoaded = true;',
    });
  });
  await context.route('https://cloudflareinsights.com/**', (route) =>
    route.fulfill({ status: 204 }),
  );
  await context.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await context.route(/https:\/\/[^/]*google-analytics\.com\//, (route) =>
    route.fulfill({ status: 204 }),
  );
  await page.goto('/');
  await expect.poll(() => cloudflareLoads).toBe(1);
  await expect(page.locator('script[data-cf-beacon]')).toHaveCount(1);
  expect(googleRequests).toEqual([]);
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  await expect(page.locator('#analytics-consent')).toBeHidden();
  await expect(page.locator('script[data-cf-beacon]')).toHaveCount(1);
  expect(await page.evaluate(() => window.__cloudflareLoaded)).toBe(true);
  expect(cloudflareLoads).toBe(1);
  expect(googleRequests).toEqual([]);
  await page.goto('/privacy/');
  await expect.poll(() => cloudflareLoads).toBe(2);
  await expect(page.locator('script[data-cf-beacon]')).toHaveCount(1);
  await expect(page.locator('#analytics-consent')).toBeHidden();
  expect(googleRequests).toEqual([]);
  await page.locator('main [data-analytics-settings]').click();
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => googleRequests.length).toBe(1);
  await expect(page.locator('script[data-cf-beacon]')).toHaveCount(1);
  expect(cloudflareLoads).toBe(2);
  await page.locator('main [data-analytics-settings]').click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'No thanks', exact: true }).click(),
  ]);
  await expect.poll(() => cloudflareLoads).toBe(3);
  await expect(page.locator('script[data-cf-beacon]')).toHaveCount(1);
  expect(googleRequests).toHaveLength(1);
  expect(await page.evaluate(() => window.__cloudflareLoaded)).toBe(true);
});
