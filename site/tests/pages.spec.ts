import { expect, test } from '@playwright/test';

test('every page answers with real content and the haki.tools canonical', async ({ page }) => {
  for (const [path, heading] of [
    ['/', 'Technology to better your business.'],
    ['/services', 'Four clear paths. All built around your business.'],
    ['/privacy', 'Privacy policy'],
    ['/contact/thanks', "You're in."],
  ] as const) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator('h1')).toHaveText(heading);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/haki\.tools\//);
  }
});

test('RVRMMO privacy policy is served unchanged at /rvrmmo/privacy', async ({ page }) => {
  const res = await page.goto('/rvrmmo/privacy');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('RVRMMO Privacy Policy');
  await expect(page.getByText('Epic Games account identifier')).toBeVisible();
});

test('unknown paths return a real 404, not the homepage', async ({ page }) => {
  const res = await page.goto('/privacy-nope');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText("This page doesn't exist.");
});

test('robots.txt and sitemap list the public pages', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://haki.tools/sitemap-index.xml');
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  for (const p of ['/', '/services/', '/privacy/', '/rvrmmo/privacy/']) expect(sitemap).toContain(`https://haki.tools${p}<`);
  expect(sitemap).not.toContain('/contact/thanks');
});

test('no horizontal page overflow', async ({ page }) => {
  for (const path of ['/', '/services', '/privacy']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test('visitors get the Tidewater & Gold theme and no theme picker', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'tide-gold');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#eef5f7');
  await expect(page.getByRole('group', { name: 'Theme explorations' })).toHaveCount(0);
});

test('?themes=1 shows the picker for trying other themes', async ({ page }) => {
  await page.goto('/?themes=1');
  const picker = page.getByRole('combobox', { name: 'Theme' });
  await expect(picker).toHaveValue('tide-gold');
  await picker.selectOption('forest');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'forest');
});
