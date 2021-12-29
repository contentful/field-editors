import { Text } from 'slate';
import { getParent } from '@udecode/plate-core';
import { createParagraphPlugin as createDefaultParagraphPlugin } from '@udecode/plate-paragraph';
import { BLOCKS } from '@contentful/rich-text-types';

import { RichTextPlugin } from '../../types';
import { Paragraph } from './Paragraph';
import { transformLift, transformWrapIn } from '../../helpers/transformers';
import { isInlineOrText } from '../../helpers/editor';
import { isValidTextContainer, isEmbedElement, isEmptyElement } from './utils';

export const createParagraphPlugin = (): RichTextPlugin => {
  const config: Partial<RichTextPlugin> = {
    type: BLOCKS.PARAGRAPH,
    component: Paragraph,
    options: {
      hotkey: ['mod+opt+0'],
    },
    softBreak: [
      // create a new line with SHIFT+Enter inside a paragraph
      {
        hotkey: 'shift+enter',
        query: {
          allow: BLOCKS.PARAGRAPH,
        },
      },
    ],
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['P', 'DIV'],
        },
      ],
      query: (el) => !isEmptyElement(el) && !isEmbedElement(el),
    },
    normalizer: [
      {
        validChildren: (_, [node]) => isInlineOrText(node),
        transform: transformLift,
      },
      {
        // Wrap orphaned text nodes in a paragraph
        match: Text.isText,
        validNode: (editor, [, path]) => {
          const parent = getParent(editor, path)?.[0];

          return !!(parent && isValidTextContainer(parent.type));
        },
        transform: transformWrapIn(BLOCKS.PARAGRAPH),
      },
    ],
  };

  return createDefaultParagraphPlugin(config);
};
