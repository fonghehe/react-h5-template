import { expect, test } from '@playwright/test';

test('browses a product and adds it to the cart', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/home');
  await expect(page.getByRole('heading', { name: '把移动业务，装进一个全栈模板' })).toBeVisible();
  await page.getByRole('link', { name: /浏览商品/ }).click();
  await expect(page.getByRole('heading', { name: '移动好物' })).toBeVisible();
  await page
    .getByRole('button', { name: /加入/ })
    .first()
    .click();
  await expect(page.getByText('已加入购物车', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /购物车，共 1 件/ }).click();
  await expect(page.getByRole('heading', { name: '确认购物袋' })).toBeVisible();
  expect(errors).toEqual([]);
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

test('resets and restarts a streaming AI conversation', async ({ page }) => {
  await page.goto('/ai');
  const composer = page.locator('.chat-composer');
  await composer.getByRole('textbox').fill('介绍一下这个模板');
  await composer.locator('.send-button').click();
  await expect(composer.locator('.stop')).toBeVisible();

  await page.locator('.chat-intro button').click();
  await expect(page.locator('.chat-message')).toHaveCount(1);
  await expect(composer.locator('.stop')).toHaveCount(0);

  await composer.getByRole('textbox').fill('如何管理状态？');
  await composer.locator('.send-button').click();
  await expect(composer.locator('.stop')).toBeVisible();
  await composer.locator('.stop').click();
  await expect(composer.locator('.stop')).toHaveCount(0);
  await expect(page.locator('.chat-message.user')).toHaveText('如何管理状态？');
});

if (process.env.E2E_APP === 'nutui') {
  test('cancels and confirms checkout with NutUI feedback on React 19', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/products');
    await page.locator('.product-card button').first().click();
    await expect(page.getByText('已加入购物车', { exact: true })).toBeVisible();
    await page.locator('.cart-pill').click();
    await page.locator('.cart-dock button').click();
    await page.locator('input[name="name"]').fill('测试用户');
    await page.locator('input[name="phone"]').fill('13800138000');
    await page.locator('input[name="address"]').fill('上海市测试路 123 号');
    await page.locator('.checkout-submit button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.locator('.checkout-submit button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').getByRole('button').last().click();
    await expect(page).toHaveURL(/\/products$/);
    expect(errors).toEqual([]);
  });
}
