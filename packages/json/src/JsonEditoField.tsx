import React from 'react';
import tokens from '@contentful/forma-36-tokens';
import throttle from 'lodash/throttle';
import { css } from 'emotion';
import Codemirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';

const CODE_MIRROR_CONFIG = {
  autoCloseBrackets: true,
  mode: { name: 'javascript', json: true },
  lineWrapping: true,
  viewportMargin: Infinity,
  indentUnit: 4,
  indentWithTabs: true,
  height: 'auto',
  theme: 'none'
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
    border: `1px solid ${tokens.colorElementLight}`,
    borderTop: 'none',
    fontSize: tokens.fontSizeM,
    '.CodeMirror': {
      height: 'auto',
      color: tokens.colorTextDark,
      fontFamily: tokens.fontStackMonospace
    }
  })
};

export function JsonEditorField(props: JsonEditorFieldProps) {
  return (
    <div className={styles.root}>
      <Codemirror
        value={props.value}
        onChange={props.onChange}
        options={{
          ...CODE_MIRROR_CONFIG,
          readOnly: props.isDisabled
        }}></Codemirror>
    </div>
  );
}
