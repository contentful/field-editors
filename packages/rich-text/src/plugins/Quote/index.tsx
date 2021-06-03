import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { Transforms, Editor, Node } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { useCustomEditor } from '../../hooks/useCustomEditor';
import { CustomEditor } from 'types';

const styles = {
  blockquote: css({
    margin: '0 0 1.3125rem',
    borderLeft: `6px solid ${tokens.colorElementLight}`,
    paddingLeft: '0.875rem',
    fontStyle: 'normal',
    '& a': {
      color: 'inherit',
    },
  }),
};

const createBlockQuote = (editor: CustomEditor) => {
  editor.toggleBlock(BLOCKS.QUOTE);
};

export function withQuoteEvents(editor: CustomEditor, event: KeyboardEvent) {
  if (!editor.selection) return;

  const [currentFragment] = Editor.fragment(editor, editor.selection.focus.path) as CustomElement[];
  const isEnter = event.keyCode === 13;

  if (isEnter && currentFragment?.type === BLOCKS.QUOTE) {
    event.preventDefault();

    const text = { text: '' };
    const paragraph = { type: BLOCKS.PARAGRAPH, children: [text] };

    if (editor.hasSelectionText()) {
      const currentOffset = editor.selection.focus.offset;
      const currentTextLength = Node.string(currentFragment).length;
      const cursorIsAtTheBeginning = currentOffset === 0;
      const cursorIsAtTheEnd = currentTextLength === currentOffset;

      if (cursorIsAtTheBeginning) {
        Transforms.insertNodes(editor, paragraph, { at: editor.selection });
      } else if (cursorIsAtTheEnd) {
        console.log('cursor at end');
        Transforms.insertNodes(editor, paragraph);
      } else {
        // Otherwise the cursor is in the middle
        Transforms.splitNodes(editor);
        Transforms.setNodes(editor, paragraph);
      }
    } else {
      Transforms.setNodes(editor, paragraph);
    }
  }

  const isBackspace = event.keyCode === 8;
  const isMod = event.ctrlKey || event.metaKey;
  const isShift = event.shiftKey;
  const isOneKey = event.keyCode === 49;

  // shift + cmd/ctrl + 1 = shortcut to toggle blockquote
  if (isMod && isShift && isOneKey) {
    createBlockQuote(editor);
  }

  // On backspace, check if quote is empty. If it's empty, switch the current fragment to a paragraph
  if (isBackspace && currentFragment?.type === BLOCKS.QUOTE) {
    if (
      editor
        .getElementFromCurrentSelection()[0]
        .children.every((item) => item.children.every((item) => item.text === ''))
    ) {
      editor.toggleBlock(BLOCKS.PARAGRAPH);
    }
  }
}

export function ToolbarQuoteButton() {
  const editor = useCustomEditor();

  function handleOnClick() {
    createBlockQuote(editor);
    Slate.ReactEditor.focus(editor);
  }

  return (
    <EditorToolbarButton
      icon="Quote"
      tooltip="Blockquote"
      label="Blockquote"
      onClick={handleOnClick}
      testId="quote-toolbar-button"
    />
  );
}

export function Quote(props: Slate.RenderLeafProps) {
  return (
    <blockquote {...props.attributes} className={styles.blockquote}>
      <div>{props.children}</div>
    </blockquote>
  );
}
