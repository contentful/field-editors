import React from 'react';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';
import { Controlled as CodeMirror } from 'react-codemirror2';

const CODE_MIRROR_CONFIG = {
  autoCloseBrackets: true,
  mode: { name: 'javascript', json: true },
  lineWrapping: true,
  viewportMargin: Infinity,
  indentUnit: 4,
  indentWithTabs: true,
  height: 'auto',
  theme: 'none',
  autoRefresh: true
};

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
    '.CodeMirror': {
      height: 'auto',
      color: tokens.gray900,
      fontFamily: tokens.fontStackMonospace,
    },
    '.CodeMirror-scroll': {
      minHeight: '6rem',
    },
  }),
};

export function JsonEditorField(props: JsonEditorFieldProps) {
  return (
    <div className={styles.root} data-test-id="json-editor-code-mirror">
      <CodeMirror
        value={props.value}
        onBeforeChange={(_editor, _data, value) => {
          props.onChange(value);
        }}
        options={{
          ...CODE_MIRROR_CONFIG,
          readOnly: props.isDisabled,
        }}
      />
    </div>
  );
}
