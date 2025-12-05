import type { Preview } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import './preview.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f5f5f5' },
        { name: 'dark', value: '#0f0f0f' },
      ],
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
    (Story) => (
      <div className="min-h-screen bg-background text-foreground antialiased p-6 font-sans">
        <Story />
      </div>
    ),
  ],
};

export default preview;
