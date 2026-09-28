import { test, expect } from '@playwright/test';
const key = 'ar_analytics_consent';
async function intercept(context) {
  const requests = [];
  context.on('request', (request) => {
    if (/googletagmanager|google-analytics/.test(request.url())) requests.push(request.url());
  });
  // A deterministic tag stand-in keeps test traffic out of the production property.
  // Unit assertions and the queued commands verify the integration contract.
  await context.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.__tagLoads = (window.__tagLoads || 0) + 1;',
    }),
  );
  await context.route(/https:\/\/[^/]*google-analytics\.com\//, (route) =>
    route.fulfill({ status: 204 }),
  );
  return requests;
}
async function commands(page) {
  return page.evaluate(() => (window.dataLayer || []).map((command) => Array.from(command)));
}

test('fresh and denied visitors make no analytics requests across pages', async ({
  page,
  context,
}) => {
  const requests = await intercept(context);
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Optional analytics' })).toBeVisible();
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  await expect(page.locator('#analytics-consent')).toBeHidden();
  await page.goto('/projects/pandawave/');
  await expect(page.locator('#analytics-consent')).toBeHidden();
  expect(requests).toEqual([]);
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe('denied');
  await page.locator('footer [data-analytics-settings]').click();
  await expect(page.getByRole('button', { name: 'Allow analytics', exact: true })).toBeFocused();
});

test('grant loads once, keeps ads denied, and queues only sanitized intent events', async ({
  page,
  context,
}) => {
  const requests = await intercept(context);
  await page.goto('/projects/pandawave/?email=secret#private');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => requests.length).toBe(1);
  await page.locator('footer [data-analytics-settings]').click();
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  expect(requests.length).toBe(1);
  let queue = await commands(page);
  expect(queue.filter((c) => c[0] === 'config')).toHaveLength(1);
  expect(queue.find((c) => c[0] === 'consent' && c[1] === 'default')[2].analytics_storage).toBe(
    'denied',
  );
  const consent = queue.find((c) => c[0] === 'consent' && c[1] === 'update')[2];
  expect(consent).toEqual({
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  // Cancel native navigation at the document after the site's listener observes each click.
  await page.evaluate(() => {
    document.addEventListener('click', (e) => e.preventDefault());
    for (const selector of [
      'a[href^="mailto:"]',
      'a[href*="linkedin.com"]',
      'a[href="/adrian-rusu-resume.pdf"]',
      'a[href="https://github.com/adrianrusu16/PandaWave"]',
    ]) {
      const anchor = document.querySelector(selector);
      anchor.href += anchor.href.includes('?') ? '&private=secret' : '?private=secret';
      anchor.click();
    }
  });
  queue = await commands(page);
  const events = queue.filter((c) => c[0] === 'event');
  expect(events.map((c) => c[1])).toEqual([
    'contact_email_click',
    'linkedin_click',
    'resume_download',
    'project_source_click',
  ]);
  expect(JSON.stringify(queue)).not.toMatch(/private|secret|email=|#private/);
  expect(events[3][2].project_slug).toBe('pandawave');
});

test('returning grant is honored; withdrawal reloads without requests or cookies', async ({
  page,
  context,
}) => {
  const requests = await intercept(context);
  await page.goto('/');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => requests.length).toBe(1);
  await page.goto('/privacy/');
  await expect.poll(() => requests.length).toBe(2);
  await expect(page.locator('#analytics-consent')).toBeHidden();
  await context.addCookies([{ name: '_ga', value: 'test', url: 'http://127.0.0.1:4175' }]);
  await page.locator('footer [data-analytics-settings]').click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'No thanks', exact: true }).click(),
  ]);
  expect(requests.length).toBe(2);
  expect((await context.cookies()).filter((c) => c.name.startsWith('_ga'))).toEqual([]);
  expect(await commands(page)).toEqual([]);
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe('denied');
});

test('cross-tab revocation unloads tracking in both tabs', async ({ page, context }) => {
  const requests = await intercept(context);
  await page.goto('/');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => requests.length).toBe(1);
  const second = await context.newPage();
  await second.goto('/about/');
  await expect.poll(() => requests.length).toBe(2);
  await page.locator('footer [data-analytics-settings]').click();
  await Promise.all([
    second.waitForEvent('load'),
    page.getByRole('button', { name: 'No thanks', exact: true }).click(),
  ]);
  expect(await commands(second)).toEqual([]);
  expect(requests.length).toBe(2);
});

test('storage failure prevents grant and keeps the site usable', async ({ page, context }) => {
  const requests = await intercept(context);
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked');
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('could not save');
  expect(requests).toEqual([]);
  await page.locator('header a[href="/projects/"]').first().click();
  await expect(page).toHaveURL(/\/projects\//);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 844, height: 390 },
]) {
  test(
    'consent choices fit mobile ' + viewport.width + 'x' + viewport.height,
    async ({ page, context }) => {
      await intercept(context);
      await page.setViewportSize(viewport);
      await page.goto('/');
      for (const choice of ['Allow analytics', 'No thanks']) {
        const button = page.getByRole('button', { name: choice, exact: true });
        await expect(button).toBeVisible();
        const box = await button.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.getByRole('button', { name: 'No thanks', exact: true }).click();
      await page.locator('footer [data-analytics-settings]').click();
      await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
      await expect(page.locator('#analytics-consent')).toBeHidden();
    },
  );
}

test('withdrawal while the tag request is pending leaves the new page untracked', async ({
  page,
  context,
}) => {
  const requests = await intercept(context);
  await context.route('https://www.googletagmanager.com/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route
      .fulfill({ contentType: 'application/javascript', body: 'window.__lateTag = true;' })
      .catch(() => {});
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Allow analytics', exact: true }).click();
  await expect.poll(() => requests.length).toBe(1);
  await page.locator('footer [data-analytics-settings]').click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'No thanks', exact: true }).click(),
  ]);
  await page.waitForTimeout(1200);
  expect(requests.length).toBe(1);
  expect(await commands(page)).toEqual([]);
  expect(await page.evaluate(() => window.__lateTag)).toBeUndefined();
});
