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
  root: css({
    border: `1px solid ${tokens.colorElementDark}`,
    borderWidth: '0 1px',
    overflowY: 'auto',
    height: 'auto',
    minHeight: 300,
    textarea: {
      height: '1px'
    },
    '.CodeMirror': {
      height: 'auto',
      maxHeight: '500px',
      color: tokens.colorTextDark,
      lineHeight: tokens.lineHeightDefault
    },
    '.CodeMirror-lines': {
      color: tokens.colorTextMid,
      padding: tokens.spacingL
    },
    '.CodeMirror-code': {
      fontFamily: tokens.fontStackMonospace,
      fontSize: tokens.fontSizeM
    },
    '.CodeMirror-scroll': {
      minHeight: '6rem'
    }
  })
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
