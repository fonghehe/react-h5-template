import { expect, test, type Page } from '@playwright/test';

async function gotoReady(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
}

test('browses a product and adds it to the cart', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await gotoReady(page, '/home');
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
    await gotoReady(page, route);
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
  await gotoReady(page, '/member');
  await page.getByRole('button', { name: /界面语言/ }).click();
  await expect(page.getByText('选择界面语言')).toBeVisible();
  await expect(page.getByText('English', { exact: true })).toBeVisible();
  await expect(page.getByText('日本語', { exact: true })).toBeVisible();
});

test('resets and restarts a streaming AI conversation', async ({ page }) => {
  await gotoReady(page, '/ai');
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

test('confirms checkout through the native form button', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await gotoReady(page, '/products');
  await page.locator('.product-card button').first().click();
  await expect(page.getByText('已加入购物车', { exact: true })).toBeVisible();
  await page.locator('.cart-pill').click();
  const stepper = page
    .locator('.cart-line :is(.adm-stepper, .nut-inputnumber, .arco-stepper)')
    .first();
  expect(
    await stepper.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const controls = element.querySelectorAll(
        '.adm-stepper-minus, .adm-stepper-plus, .nut-inputnumber-minus, .nut-inputnumber-add, :scope > div[aria-label]',
      );
      return [...controls].every((control) => {
        const box = control.getBoundingClientRect();
        return (
          box.width >= 44 &&
          box.height >= 44 &&
          box.left >= bounds.left &&
          box.right <= bounds.right
        );
      });
    }),
  ).toBe(true);
  await page.locator('.cart-dock button').click();
  await page.locator('input[name="name"]').fill('测试用户');
  await page.locator('input[name="phone"]').fill('13800138000');
  await page.locator('input[name="address"]').fill('上海市测试路 123 号');
  await page.locator('.checkout-submit button').click();
  const dialog =
    process.env.E2E_APP === 'arco'
      ? page.locator('.arco-dialog-content')
      : page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  if (process.env.E2E_APP === 'nutui') {
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await page.locator('.checkout-submit button').click();
    await expect(dialog).toBeVisible();
  }
  const confirm =
    process.env.E2E_APP === 'arco'
      ? dialog.locator('.dialog-footer-button')
      : dialog.getByRole('button');
  await confirm.last().click();
  await expect(page).toHaveURL(/\/products$/);
  expect(errors).toEqual([]);
});

test('submits login through the native form button', async ({ page }) => {
  await gotoReady(page, '/login');
  const button = page.locator('.login-form button');
  await expect(button).toHaveAttribute('type', 'submit');
  const response = page.waitForResponse((result) => result.url().includes('/api/auth/login'));
  await button.click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(/\/member$/);
  await expect(page.locator('.member-profile h2')).not.toBeEmpty();
});

test('keeps loaded products and retries only the failed next page', async ({ page }) => {
  let failNextPage = true;
  const pages: number[] = [];
  await page.route('**/api/products?*', async (route) => {
    const nextPage = Number(new URL(route.request().url()).searchParams.get('page'));
    pages.push(nextPage);
    if (nextPage === 2 && failNextPage) {
      await route.fulfill({
        status: 503,
        json: { code: 503, data: null, message: 'Page two failed', requestId: crypto.randomUUID() },
      });
    } else await route.continue();
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await gotoReady(page, '/products');
  await expect(page.locator('.product-card')).toHaveCount(4);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator('.query-recovery')).toContainText('Page two failed');
  await expect(page.locator('.product-card')).toHaveCount(4);
  const callsBeforeRetry = pages.length;
  failNextPage = false;
  await page.locator('.query-recovery button').click();
  await expect(page.locator('.product-card')).toHaveCount(6);
  expect(pages.slice(callsBeforeRetry)).toEqual([2]);
});

test('preserves composition text and keeps long chat messages inside 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  let requests = 0;
  await page.route('**/api/ai/chat', async (route) => {
    requests++;
    await route.fulfill({
      contentType: 'text/event-stream',
      body: 'data: {"type":"delta","delta":"ok"}\n\n',
    });
  });
  await gotoReady(page, '/ai');
  const input = page.locator('.chat-composer').getByRole('textbox');
  const send = page.getByRole('button', { name: '发送', exact: true });
  await input.fill('A'.repeat(160));
  await input.dispatchEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    isComposing: true,
    keyCode: 229,
  });
  await expect(input).toHaveValue('A'.repeat(160));
  expect(requests).toBe(0);
  await expect(send).toBeEnabled();
  const box = await send.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await send.click();
  await expect(page.locator('.chat-message.user')).toHaveText('A'.repeat(160));
  const sizes = await page
    .locator('.chat-page')
    .evaluate((element) => ({ width: element.clientWidth, scroll: element.scrollWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
});
