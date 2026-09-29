import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('open and download résumé serve the same canonical PDF', async ({ page, context }) => {
  await context.route(
    /https:\/\/[^/]*(?:cloudflareinsights|googletagmanager|google-analytics)\.com\//,
    (route) => route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await page.goto('/resume/');
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  const expected = fs.readFileSync('public/adrian-rusu-resume.pdf');
  const responsePromise = context.waitForEvent(
    'response',
    (response) => new URL(response.url()).pathname === '/adrian-rusu-resume.pdf',
  );
  const popupPromise = context.waitForEvent('page');
  await page.getByRole('link', { name: 'Open résumé', exact: true }).click();
  const response = await responsePromise;
  const popup = await popupPromise;
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  const opened = await context.request.get(response.url());
  expect(await opened.body()).toEqual(expected);
  await popup.close();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download résumé PDF', exact: true }).click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  expect(Buffer.concat(chunks)).toEqual(expected);
  await expect(page.locator('script[data-cf-beacon]')).toHaveCount(1);
});
