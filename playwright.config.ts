import { defineConfig, devices } from '@playwright/test';

const app = process.env.E2E_APP ?? 'antd';
const port = new Map([
  ['antd', 6777],
  ['nutui', 6778],
  ['arco', 6779],
]).get(app);

if (!port) throw new Error('E2E_APP 必须是 antd、nutui 或 arco');
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'], channel: 'chrome' } }],
  webServer: {
    command: `pnpm dev:${app}`,
    url: `${baseURL}/home`,
    reuseExistingServer: !process.env.CI,
  },
});
