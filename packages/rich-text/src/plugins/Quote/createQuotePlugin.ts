import isHotkey from 'is-hotkey';
import { KeyboardEvent } from 'react';
import { Transforms, Editor, Node, Element, Text } from 'slate';
import { BLOCKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, KeyboardHandler } from '@udecode/plate-core';
import { RichTextPlugin, CustomElement } from '../../types';
import { hasSelectionText, getElementFromCurrentSelection } from '../../helpers/editor';
import { Quote } from './components/Quote';
import { createBlockQuote, toggleBlock } from './utils';

const withQuoteEvents: KeyboardHandler<{}, HotkeyPlugin> = (editor, { options: { hotkey } }) => {
  return (event: KeyboardEvent) => {
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

    // shift + cmd/ctrl + 1 = shortcut to toggle blockquote
    if (hotkey && isHotkey(hotkey, event)) {
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
};

export function createQuotePlugin(): RichTextPlugin {
  return {
    key: BLOCKS.QUOTE,
    type: BLOCKS.QUOTE,
    isElement: true,
    component: Quote,
    options: {
      hotkey: 'mod+shift+1',
    },
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
