import type { StorybookConfig } from '@storybook/react-webpack5';
import { dirname, join } from 'path';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../packages/**/*.stories.tsx', '../packages/**/*.mdx'],

  addons: [
    getAbsolutePath('storybook-addon-swc'),
    getAbsolutePath('@storybook/addon-links'),
    {
      name: getAbsolutePath('@storybook/addon-docs'),
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],

  webpackFinal(config, options) {
    if (!config?.module?.rules || !config.resolve?.extensions) {
      return config;
    }

    // https://github.com/storybookjs/addon-webpack5-compiler-swc/blob/main/src/preset.ts
    // Don't use it directly because of https://github.com/storybookjs/addon-webpack5-compiler-swc/issues/7
    config.module.rules.push({
      test: /\.((c|m)?(j|t)sx?)$/,
      use: [
        {
          loader: require.resolve('swc-loader'),
          options: {
            jsc: {
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
      ],
      exclude: [/node_modules/, /storybook-config-entry\.js$/, /storybook-stories\.js$/],
    });

    config.resolve.extensions.push('.ts', '.tsx');

    // in ESM packages, we need to resolve .js files to .ts files
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };

    return config;
  },

  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
