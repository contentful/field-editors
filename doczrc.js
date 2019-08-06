/* global process */

import fs from 'fs';

const forma36Styles = fs.readFileSync(
  process.cwd() + '/node_modules/@contentful/forma-36-react-components/dist/styles.css'
);

export default {
  title: 'Contentful Field Editors',
  src: './packages/',
  files: '**/*.mdx',
  typescript: true,
  port: 9000,
  codeSandbox: false,
  htmlContext: {
    head: {
      raw: `<style>${forma36Styles}</style>`
    }
  },
  menu: ['Introduction', 'Components']
};
