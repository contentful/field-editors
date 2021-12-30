import { createParagraphPlugin as createDefaultParagraphPlugin } from '@udecode/plate-paragraph';
import { BLOCKS } from '@contentful/rich-text-types';

import { RichTextPlugin } from '../../types';
import { Paragraph } from './Paragraph';
import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { isInlineOrText } from '../../helpers/editor';
import { isEmbedElement, isEmptyElement } from './utils';

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
        transform: {
          [BLOCKS.PARAGRAPH]: transformUnwrap,
          default: transformLift,
        },
      },
    ],
  };

  return createDefaultParagraphPlugin(config);
};
