import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { Editor, Transforms, Node, Element } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { CustomEditor, CustomElement } from '../../types';
import { useCustomEditor } from '../../hooks/useCustomEditor';

export function withListEvents(editor: CustomEditor, event: KeyboardEvent) {
  if (!editor.selection || !editor.isList()) return;

  const isEnter = event.keyCode === 13;
  if (isEnter && !editor.hasSelectionText()) {
    event.preventDefault();

    const text = { text: '' };
    const paragraph = { type: BLOCKS.PARAGRAPH, children: [text] };
    // const li = { type: BLOCKS.LIST_ITEM, children: [text] };

    Transforms.setNodes(editor, paragraph);
    Transforms.liftNodes(editor, { at: editor.selection });
  }

  // // Toggle heading blocks when pressing cmd/ctrl+alt+1|2|3|4|5|6
  // const headingKeyCodes = {
  //   49: BLOCKS.HEADING_1,
  //   50: BLOCKS.HEADING_2,
  //   51: BLOCKS.HEADING_3,
  //   52: BLOCKS.HEADING_4,
  //   53: BLOCKS.HEADING_5,
  //   54: BLOCKS.HEADING_6,
  // };
  // const isMod = event.ctrlKey || event.metaKey;
  // const isAltOrOption = event.altKey;
  // const headingKey = headingKeyCodes[event.keyCode];

  // if (isMod && isAltOrOption && headingKey) {
  //   event.preventDefault();

  //   editor.toggleBlock(headingKey);
  // }
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
        isActive={editor.isBlockSelected(BLOCKS.UL_LIST)}
      />
      <EditorToolbarButton
        icon="ListNumbered"
        tooltip="OL"
        label="OL"
        testId="ol-toolbar-button"
        onClick={() => handleClick(BLOCKS.OL_LIST)}
        isActive={editor.isBlockSelected(BLOCKS.OL_LIST)}
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
