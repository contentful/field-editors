import { Element } from 'slate';
import { BLOCKS, HEADINGS } from '@contentful/rich-text-types';
import { onKeyDownToggleElement } from '@udecode/plate-core';
import { RichTextPlugin } from '../../types';
import { HeadingComponents } from './components/Heading';
import { isInlineOrText } from '../../helpers/editor';
import { transformLift, transformInlineOrText } from '../../helpers/transformers';

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
  exitBreak: [
    // Pressing ENTER at the start or end of a heading text inserts a
    // normal paragraph
    {
      hotkey: 'enter',
      query: {
        allow: HEADINGS,
        end: true,
        start: true,
      },
    },
  ],
  normalizer: [
    {
      match: {
        type: HEADINGS,
      },
      validChildren: (_, [node]) => isInlineOrText(node),
      transform: (editor, entry) => {
        const [node] = entry;

        if (Element.isElement(node) && node.type === BLOCKS.PARAGRAPH) {
          return transformInlineOrText(editor, entry);
        }

        return transformLift(editor, entry);
      },
    },
  ],
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
