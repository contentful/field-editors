import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';

import { CustomEditor } from 'types';
import { createMarkEvent } from '../Marks';

export function withItalicEvents(editor: CustomEditor, event: KeyboardEvent): void {
  createMarkEvent({ editor, key: 'i', type: 'italic', event });
}

export function ToolbarItalicButton() {
  return <button>Italic</button>;
}

const styles = {
  italic: css({
    fontStyle: 'italic',
  }),
};

export function Italic(props: Slate.RenderLeafProps) {
  return (
    <em {...props.attributes} className={styles.italic}>
      {props.children}
    </em>
  );
}
