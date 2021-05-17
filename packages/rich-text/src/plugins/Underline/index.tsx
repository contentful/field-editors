import * as React from 'react';
import * as Slate from 'slate-react';
import { CustomEditor } from 'types';
import { createMarkEvent } from '../Marks';

export function withUnderlineEvents(editor: CustomEditor, event: KeyboardEvent): void {
  createMarkEvent({ editor, key: 'u', type: 'underline', event });
}

export function ToolbarUnderlineButton() {
  return <button>Underline</button>;
}

export function Underline(props: Slate.RenderLeafProps) {
  return <u {...props.attributes}>{props.children}</u>;
}
