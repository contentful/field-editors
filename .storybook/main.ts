import remarkGfm from 'remark-gfm';
// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-webpack5)
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../packages/**/*.stories.tsx', '../packages/**/*.mdx'],
  addons: [
    'storybook-addon-swc',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: false,
  },
};

export default config;
