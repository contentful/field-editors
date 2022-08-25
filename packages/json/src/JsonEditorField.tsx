import React from 'react';

import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import tokens from '@contentful/f36-tokens';
import CodeMirror from '@uiw/react-codemirror';
import { css, cx } from 'emotion';

type JsonEditorFieldProps = {
  isDisabled: boolean;
  value: string;
  onChange: (value: string) => void;
};

const styles = {
  root: css({
    cursor: 'text',
    padding: tokens.spacingS,
    border: `1px solid ${tokens.gray200}`,
    borderTop: 'none',
    borderBottomLeftRadius: tokens.borderRadiusSmall,
    borderBottomRightRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeM,
    '.cm-editor': {
      color: tokens.gray900,
      fontFamily: tokens.fontStackMonospace,
      '&.cm-focused': {
        outline: 'none',
      },
    },
    '.cm-scroller': {
      minHeight: '6rem',
    },
    '&.disabled': {
      cursor: 'auto',
      '.cm-scroller ': {
        minHeight: '6rem',
        backgroundColor: tokens.gray100,
        cursor: 'not-allowed',
      },
      '.cm-editor': {
        border: `1px solid ${tokens.gray200}`,
      },
      '.cm-line': {
        cursor: 'not-allowed',
      },
      '.cm-lines': {
        cursor: 'not-allowed',
      },
    },
  }),
};

export function JsonEditorField(props: JsonEditorFieldProps) {
  return (
    <div
      className={cx(styles.root, { disabled: props.isDisabled })}
      data-test-id="json-editor-code-mirror">
      <CodeMirror
        value={props.value}
        onChange={props.onChange}
        theme="light"
        extensions={[json(), EditorView.lineWrapping]}
        basicSetup={{
          closeBrackets: false,
          lineNumbers: false,
          highlightActiveLineGutter: false,
          highlightActiveLine: false,
          foldGutter: false,
          bracketMatching: false,
        }}
        width="100%"
        editable={!props.isDisabled}
        indentWithTab={true}
      />
    </div>
  );
}
