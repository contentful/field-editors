/* global process */

import fs from 'fs';

const forma36Styles = fs.readFileSync(
  process.cwd() + '/node_modules/@contentful/forma-36-react-components/dist/styles.css'
);

const pikadayStyles = fs.readFileSync(process.cwd() + '/packages/date/styles/styles.css');

export default {
  title: 'Contentful Field Editors',
  src: './packages/',
  files: '**/*.mdx',
  typescript: true,
  port: 9000,
  codeSandbox: false,
  htmlContext: {
    head: {
      raw: `<style>${forma36Styles}</style><style>${pikadayStyles}</style>`
    }
  },
  menu: ['Introduction', 'Components'],
  modifyBabelRc: babelrc => {
    const newBabelRc = {
      ...babelrc,
      plugins: [
        ...babelrc.plugins,
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator'
      ]
    };
    return newBabelRc;
  }
};
