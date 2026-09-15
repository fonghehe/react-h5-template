import { expect, test } from '@playwright/test';

test('browses a product and adds it to the cart', async ({ page }) => {
  await page.goto('/home');
  await expect(page.getByRole('heading', { name: '把移动业务，装进一个全栈模板' })).toBeVisible();
  await page.getByRole('link', { name: /浏览商品/ }).click();
  await expect(page.getByRole('heading', { name: '移动好物' })).toBeVisible();
  await page
    .getByRole('button', { name: /加入/ })
    .first()
    .click();
  await page.getByRole('link', { name: /购物车，共 1 件/ }).click();
  await expect(page.getByRole('heading', { name: '确认购物袋' })).toBeVisible();
});

test('keeps every route inside a 320px mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const routes = [
    '/home',
    '/products',
    '/products/1',
    '/cart',
    '/checkout',
    '/member',
    '/login',
    '/examples',
    '/examples/query',
    '/examples/request',
    '/examples/mobile',
    '/ai',
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('body')).toBeVisible();
    const sizes = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(sizes.scroll, `${route} should not overflow horizontally`).toBeLessThanOrEqual(
      sizes.client,
    );
  }
});

test('opens language selection as a picker', async ({ page }) => {
  await page.goto('/member');
  await page.getByRole('button', { name: /界面语言/ }).click();
  await expect(page.getByText('选择界面语言')).toBeVisible();
  await expect(page.getByText('English', { exact: true })).toBeVisible();
  await expect(page.getByText('日本語', { exact: true })).toBeVisible();
});
