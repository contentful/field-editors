import * as React from 'react';
import * as Slate from 'slate-react';
import { ContentfulEditor } from 'types';
import { createMarkEvent } from '../Marks';

export function withUnderlineEvents(editor: ContentfulEditor, event: KeyboardEvent): void {
  createMarkEvent({ editor, key: 'u', type: 'underline', event });
}

export function ToolbarUnderlineButton() {
  return <button>Underline</button>;
}

export function Underline(props: Slate.RenderLeafProps) {
  return <u {...props.attributes}>{props.children}</u>;
}
