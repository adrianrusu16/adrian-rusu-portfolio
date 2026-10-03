import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.route('https://static.cloudflareinsights.com/**', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
});

test('Notes index opens an accessible article with working sections and project evidence', async ({
  page,
}) => {
  await page.goto('/notes/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Following the evidence.');
  await expect(page.locator('.note-card')).toHaveCount(3);
  await page
    .getByRole('link', {
      name: 'Debugging rotary and DPAD focus navigation in Android Automotive',
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/notes\/aaos-rotary-dpad-focus\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://adrianrusu.dev/notes/aaos-rotary-dpad-focus/',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://adrianrusu.dev/images/og-note-aaos-rotary-dpad-focus.png',
  );
  const section = page
    .getByRole('navigation', { name: 'In this note' })
    .getByRole('link', { name: 'Inspect the conversion before the focus graph' });
  await section.focus();
  await expect(section).toBeFocused();
  await expect(section).toHaveCSS('outline-style', 'solid');
  await section.press('Enter');
  await expect(page).toHaveURL(/#inspect-the-conversion-before-the-focus-graph$/);
  await expect(
    page.getByRole('heading', {
      name: 'Inspect the conversion before the focus graph',
      exact: true,
    }),
  ).toBeInViewport();
  await page
    .getByRole('navigation', { name: 'Related projects' })
    .getByRole('link', { name: 'PandaWave case study' })
    .click();
  await expect(page).toHaveURL(/\/projects\/pandawave\/$/);
});

test('a narrow note keeps long code within its scroll container', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/notes/android-jank-perfetto-atrace/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect(page.locator('pre')).toHaveCount(2);
  for (const block of await page.locator('pre').all())
    await expect(block).toHaveCSS('overflow-x', 'auto');
});
