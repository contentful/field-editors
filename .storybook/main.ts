import type { StorybookConfig } from '@storybook/react-webpack5';
import { dirname, join } from 'path';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../packages/**/*.stories.tsx', '../packages/**/*.mdx'],
  addons: [
    getAbsolutePath('storybook-addon-swc'),
    getAbsolutePath('@storybook/addon-links'),
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
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  docs: {
    autodocs: false,
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
