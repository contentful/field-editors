import { createParagraphPlugin as createDefaultParagraphPlugin } from '@udecode/plate-paragraph';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { RichTextPlugin } from '../../types';
import { Paragraph } from './Paragraph';
import { transformUnwrap } from 'helpers/transformers';

function isEmbed(element: HTMLElement) {
  return (
    element.hasAttribute('data-embedded-entity-inline-id') ||
    element.hasAttribute('data-entity-type')
  );
}

function isEmpty(element: HTMLElement) {
  return element.textContent === '';
}

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
      query: (el) => !isEmpty(el) && !isEmbed(el),
    },
    normalizer: [
      {
        validChildren: Object.values(INLINES),
        transform: transformUnwrap,
      },
    ],
  };

  return createDefaultParagraphPlugin(config);
};
