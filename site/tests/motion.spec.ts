import { expect, test } from '@playwright/test';

const motion = (page: import('@playwright/test').Page) => page.evaluate(() => (window as any).__hakiMotion);
const scrollToFraction = (page: import('@playwright/test').Page, f: number) =>
  page.evaluate((f) => window.scrollTo(0, f * (document.documentElement.scrollHeight - innerHeight)), f);

test('animated tier: particles start as the logo and end as the logo at the contact section', async ({ page }, info) => {
  await page.goto(info.project.name === 'mobile' ? '/?motion=low' : '/');
  await expect(page.locator('html')).toHaveClass(/particles-ready/);
  await expect.poll(async () => (await motion(page)).display, { timeout: 8000 }).toBeGreaterThan(0.98); // logo formed
  expect((await motion(page)).stage).toBe(1);
  await expect(page.locator('.hero-mark')).toBeHidden();
  await scrollToFraction(page, 1);
  await expect.poll(async () => (await motion(page)).stage, { timeout: 8000 }).toBe(8);
});

test('full tier on desktop pins the services lanes and morphs one formation per lane', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'pinning is desktop-only');
  await page.goto('/?motion=full');
  await expect(page.locator('html')).toHaveClass(/services-pinned/);
  const lanes = page.locator('[data-lane]');
  await lanes.first().scrollIntoViewIfNeeded();
  // Walk to each lane through the pin and check the particle stage matches it.
  for (let i = 0; i < 4; i++) {
    await page.evaluate((i) => window.scrollTo(0, (window as any).__hakiLaneStops()[i]), i);
    await expect.poll(async () => Math.round((await motion(page)).stage * 100) / 100, { timeout: 8000 }).toBe(3 + i);
  }
});

test('low tier stacks the lanes (no pin) and still morphs', async ({ page }) => {
  await page.goto('/?motion=low');
  await expect(page.locator('html')).toHaveClass(/particles-ready/);
  await expect(page.locator('html')).not.toHaveClass(/services-pinned/);
  await page.locator('#lane-automate').scrollIntoViewIfNeeded();
  await expect.poll(async () => (await motion(page)).stage, { timeout: 8000 }).toBeGreaterThan(4.5);
});

for (const tier of ['reduced', 'static'] as const) {
  test(`${tier} tier: no particles, no smooth scroll, logo SVG and all content visible`, async ({ page }) => {
    await page.goto(`/?motion=${tier}`);
    await expect(page.locator('html')).toHaveAttribute('data-motion', tier);
    await expect(page.locator('#particles')).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await expect(page.locator('.hero-mark svg')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await page.locator('#faq').scrollIntoViewIfNeeded();
    await expect(page.getByText('How does pricing work?')).toBeVisible();
  });
}

test('prefers-reduced-motion is detected without an override', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await ctx.close();
});

test('no WebGL falls back to the static tier', async ({ page }) => {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error test shim
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      return /webgl/.test(type) ? null : orig.call(this, type, ...rest);
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'static');
  await expect(page.locator('.hero-mark svg')).toBeVisible();
});

test('without JavaScript every section is readable', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  for (const id of ['#services', '#why-it-matters', '#process', '#faq', '#contact']) await expect(page.locator(id)).toBeVisible();
  await expect(page.locator('#lane-launch h3')).toBeVisible();
  await ctx.close();
});
