import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { QuoteIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { Transforms, Editor, Node, Element, Text } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { PlatePlugin, PlateEditor } from '@udecode/plate-core';
import { CustomElement } from '../../types';
import {
  isBlockSelected,
  toggleBlock,
  hasSelectionText,
  getElementFromCurrentSelection,
  isNodeTypeSelected,
} from '../../helpers/editor';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

const styles = {
  blockquote: css({
    margin: '0 0 1.3125rem',
    borderLeft: `6px solid ${tokens.gray200}`,
    paddingLeft: '0.875rem',
    fontStyle: 'normal',
    '& a': {
      color: 'inherit',
    },
  }),
};

interface ToolbarQuoteButtonProps {
  isDisabled?: boolean;
}

const createBlockQuote = (editor: PlateEditor) => {
  if (!editor.selection) return;

  toggleBlock(editor, BLOCKS.QUOTE);
};

function withQuoteEvents(editor: PlateEditor) {
  return (event: React.KeyboardEvent) => {
    if (!editor.selection) return;

    const [currentFragment] = Editor.fragment(
      editor,
      editor.selection.focus.path
    ) as CustomElement[];
    const isEnter = event.keyCode === 13;

    if (isEnter && currentFragment?.type === BLOCKS.QUOTE) {
      event.preventDefault();

      const text = { text: '' };
      const paragraph = { type: BLOCKS.PARAGRAPH, data: {}, children: [text] };

      if (hasSelectionText(editor)) {
        const currentOffset = editor.selection.focus.offset;
        const currentTextLength = Node.string(currentFragment).length;
        const cursorIsAtTheBeginning = currentOffset === 0;
        const cursorIsAtTheEnd = currentTextLength === currentOffset;

        if (cursorIsAtTheBeginning) {
          Transforms.insertNodes(editor, paragraph, { at: editor.selection });
        } else if (cursorIsAtTheEnd) {
          Transforms.insertNodes(editor, paragraph);
        } else {
          // Otherwise the cursor is in the middle
          Transforms.splitNodes(editor);
          Transforms.setNodes(editor, paragraph);
        }
      } else {
        Transforms.insertNodes(editor, paragraph);
      }
    }

    const isBackspace = event.keyCode === 8;
    const isMod = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const isOneKey = event.keyCode === 49;

    // shift + cmd/ctrl + 1 = shortcut to toggle blockquote
    if (isMod && isShift && isOneKey && !isNodeTypeSelected(editor, BLOCKS.TABLE)) {
      createBlockQuote(editor);
    }

    // On backspace, check if quote is empty. If it's empty, switch the current fragment to a paragraph
    if (isBackspace && currentFragment?.type === BLOCKS.QUOTE) {
      const quoteIsEmpty = (
        getElementFromCurrentSelection(editor)[0] as CustomElement
      ).children.every(
        (item) =>
          Element.isElement(item) &&
          item.children.every((item) => Text.isText(item) && item.text === '')
      );

      if (quoteIsEmpty) toggleBlock(editor, BLOCKS.PARAGRAPH);
    }
  };
}

export function ToolbarQuoteButton(props: ToolbarQuoteButtonProps) {
  const editor = useContentfulEditor();

  function handleOnClick() {
    if (!editor) return;

    createBlockQuote(editor);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Blockquote"
      onClick={handleOnClick}
      testId="quote-toolbar-button"
      isDisabled={props.isDisabled}
      isActive={isBlockSelected(editor, BLOCKS.QUOTE)}>
      <QuoteIcon />
    </ToolbarButton>
  );
}

export function Quote(props: Slate.RenderLeafProps) {
  return (
    <blockquote {...props.attributes} className={styles.blockquote}>
      {props.children}
    </blockquote>
  );
}

export function createQuotePlugin(): PlatePlugin {
  return {
    key: BLOCKS.QUOTE,
    isElement: true,
    component: Quote,
    handlers: {
      onKeyDown: withQuoteEvents,
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'BLOCKQUOTE',
        },
      ],
    },
  };
}
