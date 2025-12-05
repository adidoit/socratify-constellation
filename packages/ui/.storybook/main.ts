import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/react-vite';

const storybookDir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': join(storybookDir, '../src'),
      '@constellation/supabase': join(storybookDir, './mocks/supabase'),
    };
    return config;
  },
};

export default config;
