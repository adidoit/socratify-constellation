import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

export type AppPlaywrightOptions = {
  testDir: string;
  baseURL: string;
  webServerCommand: string;
  webServerUrl?: string;
  storageState?: string;
  globalSetup?: string;
  envFile?: string;
};

export function loadTestEnv(envFile: string = '.env.test') {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export function createPlaywrightConfig(options: AppPlaywrightOptions): PlaywrightTestConfig {
  loadTestEnv(options.envFile);

  const {
    testDir,
    baseURL,
    webServerCommand,
    webServerUrl = baseURL,
    storageState,
    globalSetup,
  } = options;

  return defineConfig({
    testDir,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    use: {
      baseURL,
      storageState,
      trace: 'on-first-retry',
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    webServer: {
      command: webServerCommand,
      url: webServerUrl,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    globalSetup,
  });
}
