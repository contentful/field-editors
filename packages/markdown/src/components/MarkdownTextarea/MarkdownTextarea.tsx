import React, { useRef, useEffect, useState, memo } from 'react';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';
import { createMarkdownEditor } from './createMarkdownEditor';
import { EditorDirection } from '../../types';

type InitializedEditorType = ReturnType<typeof createMarkdownEditor>;

type MarkdownTextareaProps = {
  direction: EditorDirection;
  disabled: boolean;
  visible: boolean;
  onReady: (editor: InitializedEditorType) => void;
};

const styles = {
  root: css`
    border: 1px solid ${tokens.colorElementDark};
    border-width: 0 1px;
    overflow-y: 'auto';
    height: 'auto';
    min-height: 300px;
    textarea {
      height: 1px;
    }
    .CodeMirror {
      height: 'auto';
      max-height: '500px';
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
  `
};

export const MarkdownTextarea = memo((props: MarkdownTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editor, setEditor] = useState<InitializedEditorType | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      setEditor(
        createMarkdownEditor(textareaRef.current, {
          direction: props.direction,
          readOnly: true
        })
      );
    }
  }, []);

  useEffect(() => {
    if (editor) {
      props.onReady(editor);
    }
  }, [editor]);

  return (
    <div
      className={styles.root}
      data-test-id="markdown-textarea"
      style={{ display: props.visible ? 'block' : 'none' }}>
      <textarea ref={textareaRef} style={{ display: 'none' }} />
    </div>
  );
});

MarkdownTextarea.displayName = 'MarkdownTextarea';
