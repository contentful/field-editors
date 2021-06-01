import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { Editor, Transforms, Node } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { CustomEditor, CustomElement } from '../../types';
import { useCustomEditor } from '../../hooks/useCustomEditor';

export function withListEvents(editor: CustomEditor, event: KeyboardEvent) {
  if (!editor.selection) return;
}

export function ToolbarListButton() {
  const editor = useCustomEditor();

  function handleClick(type: string): void {
    if (!editor.selection) return;

    editor.toggleBlock(type);
    Slate.ReactEditor.focus(editor);
  }

  return (
    <React.Fragment>
      <EditorToolbarButton
        icon="ListBulleted"
        tooltip="UL"
        label="UL"
        testId="ul-toolbar-button"
        onClick={() => handleClick(BLOCKS.UL_LIST)}
      />
      <EditorToolbarButton
        icon="ListNumbered"
        tooltip="OL"
        label="OL"
        testId="ol-toolbar-button"
        onClick={() => handleClick(BLOCKS.OL_LIST)}
      />
    </React.Fragment>
  );
}

const styles = {
  [BLOCKS.UL_LIST]: css`
    margin: 0 0 1.25rem 1.25rem;
    list-style: disc;
  `,
  [BLOCKS.OL_LIST]: css`
    margin: 0 0 1.25rem 1.25rem;
    list-style: decimal;
  `,
  [BLOCKS.LIST_ITEM]: css`
    margin: 0;
  `,
};

export function createList(Tag, block: BLOCKS) {
  return function List(props: Slate.RenderElementProps) {
    return (
      <Tag {...props.attributes} className={styles[block]}>
        {props.children}
      </Tag>
    );
  };
}

export const UL = createList('ul', BLOCKS.UL_LIST);
export const OL = createList('ol', BLOCKS.OL_LIST);
export const LI = createList('li', BLOCKS.LIST_ITEM);
