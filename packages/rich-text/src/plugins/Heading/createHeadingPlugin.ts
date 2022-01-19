import { BLOCKS, HEADINGS } from '@contentful/rich-text-types';
import { getAbove, onKeyDownToggleElement } from '@udecode/plate-core';

import { isInlineOrText } from '../../helpers/editor';
import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { RichTextPlugin } from '../../types';
import { HeadingComponents } from './components/Heading';

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
        onKeyDown: onKeyDownToggleElement,
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
