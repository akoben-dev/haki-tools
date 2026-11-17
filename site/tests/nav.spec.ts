import { expect, test } from '@playwright/test';

test('mobile menu opens, closes on Escape, and links work', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'menu button is mobile-only');
  await page.goto('/?motion=static');
  const btn = page.locator('[data-menu-button]');
  await btn.click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await btn.click();
  await page.locator('#mobile-menu a', { hasText: 'Services' }).click();
  await expect(page).toHaveURL(/\/services/);
});
