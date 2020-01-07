import React from 'react';
import Markdown from 'markdown-to-jsx';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';

const styles = {
  root: css`
    border: 1px solid ${tokens.colorElementDark};
    border-width: 0 1px;
    overflow-y: auto;
    word-wrap: break-word;
    overflow-wrap: break-word;
    height: 100%;
    max-height: 500px;
    min-height: 300px;
    padding: ${tokens.spacingL};
    font-size: ${tokens.fontSizeM};
    font-family: ${tokens.fontStackPrimary};
    line-height: ${tokens.lineHeightDefault};
    color: ${tokens.colorTextMid};

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: ${tokens.spacingL};
      margin-bottom: ${tokens.spacingM};
      color: ${tokens.colorTextDark};
    }

    h1 {
      font-size: 1.9em;
    }
    h2 {
      font-size: 1.75em;
    }
    h3 {
      font-size: 1.6em;
    }
    h4 {
      font-size: 1.45em;
    }
    h5 {
      font-size: 1.3em;
    }
    h6 {
      font-size: 1.15em;
    }

    p {
      margin-top: 0;
      margin-bottom: ${tokens.spacingM};
    }

    ul,
    ol {
      margin: ${tokens.spacingS} 0;
      padding-left: ${tokens.spacingM};
    }
    ul > li {
      list-style-type: disc;
      margin-bottom: 0;
    }

    ol > li {
      list-style-type: decimal;
      margin-bottom: 0;
    }

    table {
      table-layout: fixed;
      border-right-width: 0;
      border-bottom-width: 0;
      width: 80%;
      margin-left: auto;
      margin-right: auto;
      border-spacing: 0;
      border-collapse: collapse;
      border: 1px solid ${tokens.colorElementMid};
    }

    table th,
    table td {
      padding: 5px;
      border-left-width: 0;
      border-top-width: 0;
    }

    table th {
      background: ${tokens.colorElementLight};
    }

    table td {
      border: 1px solid ${tokens.colorElementMid};
    }

    a {
      color: ${tokens.colorBlueMid};
    }

    hr {
      margin-top: ${tokens.spacingL};
      margin-bottom: ${tokens.spacingL};
      height: 1px;
      background-color: ${tokens.colorElementMid};
      border: none;
    }

    blockquote {
      border-left: 4px solid ${tokens.colorElementLight};
      padding-left: ${tokens.spacingL};
      margin: 0;
      margin-top: ${tokens.spacingM};
      font-style: italic;
    }

    img {
      margin: ${tokens.spacingM} auto;
      display: block;
      max-width: 80%;
    }

    pre code {
      font-size: ${tokens.fontSizeS};
      font-family: ${tokens.fontStackMonospace};
    }
  `
};

export const MarkdownPreview = (props: { value: string }) => {
  return (
    <div className={styles.root} data-test-id="markdown-preview">
      <Markdown>{props.value}</Markdown>
    </div>
  );
};
