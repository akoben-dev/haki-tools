import { expect, test } from '@playwright/test';

const fill = async (page: import('@playwright/test').Page) => {
  await page.fill('#f-name', 'Test Person');
  await page.fill('#f-email', 'test@example.com');
  await page.fill('#f-business', 'Test Co');
  await page.fill('#f-description', 'Testing the contact form end to end.');
};

test('inline validation blocks an empty submission', async ({ page }) => {
  await page.goto('/?motion=static#contact');
  await page.locator('[data-contact-form] button[type=submit]').click();
  await expect(page.locator('[data-error-for="email"]')).toHaveText('Please enter a valid email address.');
  await expect(page.locator('#f-name')).toBeFocused();
});

test('JS submission posts JSON and shows the success state', async ({ page }) => {
  let body: Record<string, string> = {};
  await page.route('**/api/contact', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto('/?motion=static#contact');
  await fill(page);
  await page.locator('[data-contact-form] button[type=submit]').click();
  await expect(page.locator('[data-form-success]')).toBeVisible();
  expect(body).toMatchObject({ name: 'Test Person', email: 'test@example.com', business_name: 'Test Co', company_website: '' });
  expect(Number(body.started_at)).toBeGreaterThan(0);
});

test('a failed send keeps the form and offers an email fallback', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.fulfill({ status: 500, json: { ok: false } }));
  await page.goto('/?motion=static#contact');
  await fill(page);
  await page.locator('[data-contact-form] button[type=submit]').click();
  await expect(page.locator('[data-form-status] a[href^="mailto:"]')).toBeVisible();
  await expect(page.locator('[data-contact-form]')).toBeVisible();
});

test('without JavaScript the form still posts natively', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  let posted = '';
  await page.route('**/api/contact', async (route) => {
    posted = route.request().postData() ?? '';
    await route.fulfill({ status: 303, headers: { location: '/contact/thanks' } });
  });
  await page.goto('/#contact');
  await fill(page);
  await page.locator('[data-contact-form] button[type=submit]').click();
  await expect(page.locator('h1')).toHaveText("You're in.");
  expect(posted).toContain('email=test%40example.com');
  await ctx.close();
});
