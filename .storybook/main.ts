import type { StorybookConfig } from '@storybook/react-webpack5';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../packages/**/*.stories.tsx', '../packages/**/*.mdx'],
  addons: [
    'storybook-addon-swc',
    '@storybook/addon-links',
    {
      name: '@storybook/addon-essentials',
      options: {
        docs: false,
      },
    },
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
  webpackFinal: async (config) => {
    const customConfig = { ...config };

    if (!customConfig.resolve) {
      customConfig.resolve = {};
    }

    customConfig.resolve.extensionAlias = {
      '.js': ['.tsx', '.ts', '.js'],
    };
    return customConfig;
  },
};

export default config;
