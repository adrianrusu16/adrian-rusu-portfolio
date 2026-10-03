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

test('Notes can be reached through desktop and mobile navigation', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Notes', exact: true })
    .click();
  await expect(page).toHaveURL(/\/notes\/$/);
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Notes', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  const mobile = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(mobile).toBeVisible();
  await mobile.getByRole('link', { name: 'Notes', exact: true }).click();
  await expect(page).toHaveURL(/\/notes\/$/);
  await expect(mobile).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

for (const width of [820, 1024]) {
  test(`the expanded primary navigation does not overlap header actions at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/notes/');
    const navigation = page.getByRole('navigation', { name: 'Main navigation' });
    if (await navigation.isVisible()) {
      const nav = await navigation.boundingBox();
      const actions = await page.locator('.header-actions').boundingBox();
      expect(nav.x + nav.width).toBeLessThanOrEqual(actions.x);
    } else
      await expect(
        page.getByRole('button', { name: 'Open navigation', exact: true }),
      ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}
