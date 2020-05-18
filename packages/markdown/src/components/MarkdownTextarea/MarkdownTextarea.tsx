import React, { useRef, useEffect, useState } from 'react';
import tokens from '@contentful/forma-36-tokens';
import { css, cx } from 'emotion';
import { createMarkdownEditor } from './createMarkdownEditor';
import { EditorDirection } from '../../types';

export type InitializedEditorType = ReturnType<typeof createMarkdownEditor>;

type MarkdownTextareaProps = {
  mode: 'default' | 'zen';
  direction: EditorDirection;
  disabled: boolean;
  visible: boolean;
  onReady: (editor: InitializedEditorType) => void;
};

const styles = {
  root: css`
    border: 1px solid ${tokens.colorElementDark};
    border-width: 0 1px;
    overflow-y: auto;
    height: auto;
    min-height: 300px;

    .CodeMirror {
      height: auto;
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
    span.cm-variable-2 {
      color: ${tokens.colorTextMid};
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
    span.cm-comment {
      color: ${tokens.colorTextLight};
    }
    span.cm-link,
    span.cm-url {
      color: ${tokens.colorBlueMid} !important;
    }
    span.cm-link {
      text-decoration: underline;
    }
  `,
  framed: css({
    '.CodeMirror': {
      maxHeight: '500px',
    },
  }),
  zen: css({
    border: 'none !important',
    '.CodeMirror-lines': {
      maxWidth: '650px',
      margin: '0 auto',
    },
  }),
  disabled: css`
    .CodeMirror {
      background: ${tokens.colorElementLightest};
    }
    .CodeMirror-cursors {
      visibility: hidden !important;
    }
  `,
};

export const MarkdownTextarea = React.memo((props: MarkdownTextareaProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<InitializedEditorType | null>(null);

  useEffect(() => {
    if (hostRef.current) {
      setEditor(
        createMarkdownEditor(
          hostRef.current,
          Object.assign(
            {},
            {
              direction: props.direction,
              readOnly: true,
            },
            props.mode === 'zen'
              ? {
                  fixedHeight: true,
                  height: '100%',
                }
              : {}
          )
        )
      );
    }
  }, []);

  useEffect(() => {
    if (editor) {
      props.onReady(editor);
    }
  }, [editor]);

  const className = cx(
    styles.root,
    props.mode === 'default' ? styles.framed : styles.zen,
    props.disabled && styles.disabled
  );

  return (
    <div
      className={className}
      ref={hostRef}
      data-test-id="markdown-textarea"
      style={{ display: props.visible ? 'block' : 'none' }}
    />
  );
});

MarkdownTextarea.displayName = 'MarkdownTextarea';
