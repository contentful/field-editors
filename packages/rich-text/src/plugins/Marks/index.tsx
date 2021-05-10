import * as React from 'react';
import { Editor } from 'slate';
import { RenderElementProps } from 'slate-react';
import { ContentfulEditor } from 'types';

export function withMarksPlugin(editor: ContentfulEditor) {
  function isMarkActive(type: string) {
    const marks = Editor.marks(editor);
    return !!marks?.[type];
  }

  function toggleMark(type: string) {
    const isActive = isMarkActive(type);

    if (isActive) {
      Editor.removeMark(editor, type);
    } else {
      Editor.addMark(editor, type, true);
    }
  }

  editor.isMarkActive = isMarkActive;
  editor.toggleMark = toggleMark;

  return editor;
}

interface MarkEvent {
  editor: ContentfulEditor;
  key: string;
  type: string;
  event: KeyboardEvent;
}

export function createMarkEvent({ editor, key, type, event }: MarkEvent): void {
  if ((!event.ctrlKey || !event.metaKey) && event.key !== key) return;

  event.preventDefault();

  editor.toggleMark(type);
}

// TODO: Add props and events
export function ToolbarMarkButton(props: RenderElementProps) {
  return <button>{props.children}</button>;
}
