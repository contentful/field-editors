import { BLOCKS, HEADINGS } from '@contentful/rich-text-types';
import { getAbove, HotkeyPlugin, KeyboardHandler, toggleNodeType } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

import { isBlockSelected, isInlineOrText } from '../../helpers/editor';
import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { RichTextEditor, RichTextPlugin } from '../../types';
import { HeadingComponents } from './components/Heading';

const buildHeadingEventHandler =
  (type: BLOCKS): KeyboardHandler<RichTextEditor, HotkeyPlugin> =>
  (editor, { options: { hotkey } }) =>
  (event) => {
    if (editor.selection && hotkey && isHotkey(hotkey, event)) {
      const isActive = isBlockSelected(editor, type);
      editor.tracking.onShortcutAction(isActive ? 'remove' : 'insert', { nodeType: type });

      toggleNodeType(editor, { activeType: type, inactiveType: BLOCKS.PARAGRAPH });
    }
  };

export const createHeadingPlugin = (): RichTextPlugin => ({
  key: 'HeadingPlugin',
  softBreak: [
    // create a new line with SHIFT+Enter inside a heading
    {
      hotkey: 'shift+enter',
      query: {
        allow: HEADINGS,
      },
    },
  ],
  normalizer: [
    {
      match: {
        type: HEADINGS,
      },
      validChildren: (_, [node]) => isInlineOrText(node),
      transform: {
        [BLOCKS.PARAGRAPH]: transformUnwrap,
        default: transformLift,
      },
    },
  ],
  then: (editor) => {
    return {
      exitBreak: [
        // Pressing ENTER at the start or end of a heading text inserts a
        // normal paragraph.
        {
          hotkey: 'enter',
          query: {
            allow: HEADINGS,
            end: true,
            start: true,

            // Exclude headings inside lists as it interferes with the list's
            // insertBreak implementation
            filter: ([, path]) =>
              !getAbove(editor, {
                at: path,
                match: { type: BLOCKS.LIST_ITEM },
              }),
          },
        },
      ],
    } as Partial<RichTextPlugin>;
  },
  plugins: HEADINGS.map((nodeType, idx) => {
    const level = idx + 1;
    const tagName = `h${level}`;

    return {
      key: nodeType,
      type: nodeType,
      isElement: true,
      component: HeadingComponents[nodeType],
      options: {
        hotkey: [`mod+alt+${level}`],
      },
      handlers: {
        onKeyDown: buildHeadingEventHandler(nodeType),
      },
      deserializeHtml: {
        rules: [
          {
            validNodeName: tagName.toUpperCase(),
          },
        ],
      },
    };
  }),
});
