import { defineConfig } from '@playwright/test';

/**
 * iPhone 12 相当の viewport / DPR / UA を Chromium で再現して GH Pages 本番版を視覚確認するための設定。
 * WebKit ブラウザは未インストールのため、device プリセットではなく手動指定で iPhone 縦画面を模倣する。
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://imay4th.github.io/happy-bday-kocchan/',
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  },
  projects: [
    {
      name: 'iPhone 12 (Chromium emulation)',
      use: {},
    },
  ],
});
