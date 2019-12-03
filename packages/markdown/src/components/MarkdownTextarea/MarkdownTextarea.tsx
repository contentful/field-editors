import React from 'react';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';
import { UnControlled as CodeMirror } from 'react-codemirror2';

type MarkdownTextareaProps = {
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
  return (
    <div className={styles.root} data-test-id="markdown-textarea">
      <CodeMirror
        value={props.value}
        onChange={(_editor, _data, value) => {
          props.onChange(value);
        }}
        options={{
          readOnly: props.isDisabled,
          inputStyle: 'textarea',
          mode: 'markdown',
          lineNumbers: false,
          undoDepth: 200,
          lineWrapping: true,
          theme: 'elegant',
          tabSize: 2,
          indentWithTabs: false,
          indentUnit: 2
        }}
      />
    </div>
  );
}
