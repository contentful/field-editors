import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { ContentfulEditor } from 'types';
import { createMarkEvent } from '../Marks';

export function withBoldEvents(editor: ContentfulEditor, event: KeyboardEvent): void {
  createMarkEvent({ editor, key: 'b', type: 'bold', event });
}

export function ToolbarBoldButton() {
  return <button>Bold</button>;
}

const styles = {
  bold: css({
    fontWeight: 600,
  }),
};

export function Bold(props: Slate.RenderLeafProps) {
  return (
    <strong {...props.attributes} className={styles.bold}>
      {props.children}
    </strong>
  );
}
