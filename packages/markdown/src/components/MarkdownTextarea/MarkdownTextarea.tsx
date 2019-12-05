import React, { useRef, useEffect } from 'react';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';
import { createMarkdownEditor } from './createMarkdownEditor';
import { EditorDirection } from '../../types';

type MarkdownTextareaProps = {
  direction: EditorDirection;
  isDisabled: boolean;
  value: string;
  onChange: (value: string) => void;
};

const styles = {
  root: css`
    border: 1px solid ${tokens.colorElementDark};
    border-width: 0 1px;
    overflow-y: 'auto';
    height: 'auto';
    min-height: 300;
    textarea {
      height: 1px;
    }
    .CodeMirror {
      height: 'auto';
      max-height: '500px';
      color: ${tokens.colorTextDark};
      line-height: ${tokens.lineHeightDefault};
    }
    .CodeMirror-lines {
      color: ${tokens.colorTextMid};
      padding: ${tokens.spacingL};
    }
    .CodeMirror-code {
      font-family: ${tokens.fontStackMonospace};
      font-size: ${tokens.fontSizeM};
    }
    .CodeMirror-scroll {
      min-height: '6rem';
    }
    .cm-header {
      color: ${tokens.colorTextDark};
    }
    .cm-header-1 {
      font-size: 1.9em;
    }
    .cm-header-2 {
      font-size: 1.75em;
    }
    .cm-header-3 {
      font-size: 1.6em;
    }
    .cm-header-4 {
      font-size: 1.45em;
    }
    .cm-header-5 {
      font-size: 1.3em;
    }
    .cm-header-6 {
      font-size: 1.15em;
    }

    span.cm-tag,
    span.cm-string,
    span.cm-attribute {
      color: ${tokens.colorRedBase};
    }
    span.cm-string {
      text-decoration: none !important;
    }
    span.cm-quote,
    span.cm-comment,
    span.cm-variable-2 {
      color: ${tokens.colorTextLight};
    }
    span.cm-link,
    span.cm-url {
      color: ${tokens.colorBlueMid} !important;
    }
    span.cm-link {
      text-decoration: underline;
    }
  `
};

export function MarkdownTextarea(props: MarkdownTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      createMarkdownEditor(textareaRef.current, {
        direction: props.direction
      });
    }
  }, []);

  return (
    <div className={styles.root} data-test-id="markdown-textarea">
      <textarea ref={textareaRef} style={{ display: 'none' }} />
    </div>
  );
}
