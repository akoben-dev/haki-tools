import { defineConfig, devices } from '@playwright/test';

// Runs against the production build (`astro preview`), on desktop and phone viewports.
// SwiftShader gives headless Chromium a software WebGL so the particle tier can be tested.
const gl = { launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] } };

export default defineConfig({
  testDir: 'tests',
  timeout: 45_000,
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321' },
  webServer: { command: 'npx astro preview --port 4321', url: 'http://localhost:4321', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, ...gl } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...gl } },
  ],
});
