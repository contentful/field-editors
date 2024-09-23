import { BLOCKS, HEADINGS } from '@contentful/rich-text-types';
import isHotkey from 'is-hotkey';

import { isBlockSelected, isInlineOrText, toggleElement } from '../../helpers/editor';
import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { isMarkActive, getAboveNode } from '../../internal/queries';
import { KeyboardHandler, PlatePlugin, HotkeyPlugin } from '../../internal/types';
import { COMMAND_PROMPT } from '../CommandPalette/constants';
import { HeadingComponents } from './components/Heading';

const buildHeadingEventHandler =
  (type: BLOCKS): KeyboardHandler<HotkeyPlugin> =>
  (editor, { options: { hotkey } }) =>
  (event) => {
    if (editor.selection && hotkey && isHotkey(hotkey, event)) {
      if (type !== BLOCKS.PARAGRAPH) {
        const isActive = isBlockSelected(editor, type);
        editor.tracking.onShortcutAction(isActive ? 'remove' : 'insert', { nodeType: type });
      }

      toggleElement(editor, { activeType: type, inactiveType: BLOCKS.PARAGRAPH });
    }
  };

export const createHeadingPlugin = (): PlatePlugin => ({
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
              !getAboveNode(editor, {
                at: path,
                match: { type: BLOCKS.LIST_ITEM },
              }) && !isMarkActive(editor, COMMAND_PROMPT),
          },
        },
      ],
    } as Partial<PlatePlugin>;
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
