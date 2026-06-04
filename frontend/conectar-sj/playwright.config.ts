import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx ng serve',
    url: 'http://localhost:4200',
    timeout: 120000,
    reuseExistingServer: true,
  },
});
