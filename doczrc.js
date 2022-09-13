import tokens from '@contentful/f36-tokens';

export default {
  title: 'Contentful Field Editors',
  description: 'React components and apps for building Contentful entry editor',
  src: './packages/',
  files: '**/*.mdx',
  typescript: true,
  port: 9000,
  codeSandbox: false,
  themeConfig: {
    colors: {
      primary: tokens.blue600,
      secondary: tokens.blue100,
      gray: tokens.gray300,
      link: tokens.blue600,
      blue: tokens.blue600,
      text: tokens.gray800,
    },
    styles: {
      body: {
        fontFamily: tokens.fontStackPrimary,
        fontSize: '14px',
        lineHeight: tokens.lineHeightDefault,
      },
      code: {
        margin: '0 3px',
        padding: '4px 6px',
        borderRadius: '3px',
        fontFamily: tokens.fontStackMonospace,
        fontSize: '0.85em',
      },
      pre: {
        fontFamily: tokens.fontStackMonospace,
        fontSize: 14,
        lineHeight: 1.8,
      },
    },
  },
  menu: ['Introduction', 'Editors', 'Shared'],
  wrapper: 'docz.wrapper.jsx',
  modifyBabelRc: (babelrc) => {
    const newBabelRc = {
      ...babelrc,
      plugins: [
        ...babelrc.plugins,
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
      ],
    };
    return newBabelRc;
  },
  modifyBundlerConfig: (webpackConfig) => {
    const config = {
      ...webpackConfig,
      module: {
        ...webpackConfig.module,
        rules: [
          ...webpackConfig.module.rules,
          {
            test: /\.mjs$/,
            type: 'javascript/auto',
          },
        ],
      },
    };
    return config;
  },
};
