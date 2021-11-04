import React from 'react';
import Markdown from 'markdown-to-jsx';
import tokens from '@contentful/f36-tokens';
import DOMPurify from 'dompurify';
import { css, cx } from 'emotion';
import { EditorDirection, PreviewComponents } from '../types';

const styles = {
  root: css`
    border: 1px solid ${tokens.gray400};
    border-width: 0 1px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-height: 300px;
    padding: ${tokens.spacingL};
    font-size: ${tokens.fontSizeM};
    font-family: ${tokens.fontStackPrimary};
    line-height: ${tokens.lineHeightDefault};
    color: ${tokens.gray700};
    white-space: pre-line;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: ${tokens.spacingL};
      margin-bottom: ${tokens.spacingM};
      color: ${tokens.gray900};
    }

    h1:first-child,
    h2:first-child,
    h3:first-child,
    h4:first-child,
    h5:first-child,
    h6:first-child {
      margin-top: 0;
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
      margin: ${tokens.spacingM} auto;
      border-spacing: 0;
      border-collapse: collapse;
      border: 1px solid ${tokens.gray300};
    }

    table th,
    table td {
      padding: 5px;
      border-left-width: 0;
      border-top-width: 0;
    }

    table th {
      background: ${tokens.gray200};
    }

    table td {
      border: 1px solid ${tokens.gray300};
    }

    a {
      color: ${tokens.blue500};
    }

    hr {
      margin-top: ${tokens.spacingL};
      margin-bottom: ${tokens.spacingL};
      height: 1px;
      background-color: ${tokens.gray300};
      border: none;
    }

    blockquote {
      border-left: 4px solid ${tokens.gray200};
      padding-left: ${tokens.spacingL};
      margin: 0;
      margin-top: ${tokens.spacingM};
      font-style: italic;
    }

    img {
      margin: ${tokens.spacingM} auto;
      display: block;
      max-width: 80%;
      max-height: 250px;
    }

    pre code {
      font-size: ${tokens.fontSizeS};
      font-family: ${tokens.fontStackMonospace};
    }

    .embedly-card {
      margin: ${tokens.spacingM} auto;
      display: block;
    }
  `,
  framed: css({
    height: '100%',
    maxHeight: '500px',
    overflowY: 'auto',
  }),
  zen: css({
    maxWidth: '650px',
    margin: '0 auto',
    border: 'none !important',
  }),
  rtl: css({
    direction: 'rtl',
  }),
};

type MarkdownPreviewProps = {
  /**
   * Minimum height to set for the markdown preview
   */
  minHeight?: string | number;
  mode: 'default' | 'zen';
  direction: EditorDirection;
  value: string;
  previewComponents?: PreviewComponents;
};

function MarkdownLink(props: {
  href: string;
  title: string;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  Embedly?: React.SFC<{ url: string }>;
}) {
  const { Embedly, children, ...rest } = props;

  if (props.className === 'embedly-card' && Embedly) {
    return <Embedly url={props.href} />;
  }

  return (
    <a {...rest} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export const MarkdownPreview = React.memo((props: MarkdownPreviewProps) => {
  const className = cx(
    styles.root,
    props.minHeight !== undefined ? css({ minHeight: props.minHeight }) : undefined,
    props.mode === 'default' ? styles.framed : styles.zen,
    props.direction === 'rtl' ? styles.rtl : undefined
  );

  // See the list of allowed Tags here:
  // https://github.com/cure53/DOMPurify/blob/main/src/tags.js#L3-L121
  const cleanHTML = React.useMemo(() => {
    return DOMPurify.sanitize(props.value);
  }, [props.value]);

  return (
    <div className={className} data-test-id="markdown-preview">
      <Markdown
        options={{
          overrides: {
            a: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              component: MarkdownLink as any,
              props: {
                Embedly: props.previewComponents?.embedly,
              },
            },
          },
        }}>
        {cleanHTML}
      </Markdown>
    </div>
  );
});

MarkdownPreview.displayName = 'MarkdownPreview';
