import { BLOCKS, HEADINGS } from '@contentful/rich-text-types';
import { getAbove, toggleNodeType } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

import { isBlockSelected, isInlineOrText } from '../../helpers/editor';
import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { TrackingProvider } from '../../TrackingProvider';
import { RichTextPlugin } from '../../types';
import { HeadingComponents } from './components/Heading';

const buildHeadingEventHandler =
  (tracking: TrackingProvider, type: BLOCKS) => (editor, plugin) => (event) => {
    if (!editor.selection || !isHotkey(plugin.options.hotkey, event)) {
      return;
    }

    const isActive = isBlockSelected(editor, type);
    tracking.onShortcutAction(isActive ? 'remove' : 'insert', { nodeType: type });

    toggleNodeType(editor, { activeType: type, inactiveType: BLOCKS.PARAGRAPH });
  };

export const createHeadingPlugin = (tracking: TrackingProvider): RichTextPlugin => ({
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
        onKeyDown: buildHeadingEventHandler(tracking, nodeType),
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
