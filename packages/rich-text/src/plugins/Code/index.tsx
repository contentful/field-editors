import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';

import { CustomEditor } from 'types';
import { createMarkEvent } from '../Marks';

export function withCodeEvents(editor: CustomEditor, event: KeyboardEvent): void {
  createMarkEvent({ editor, key: '/', type: 'code', event });
}

export function ToolbarCodeButton() {
  return <button>Code</button>;
}

const styles = {
  code: css({
    fontFamily: 'monospace',
    fontSize: '.9em',
  }),
};

export function Code(props: Slate.RenderLeafProps) {
  return (
    <code {...props.attributes} className={styles.code}>
      {props.children}
    </code>
  );
}
