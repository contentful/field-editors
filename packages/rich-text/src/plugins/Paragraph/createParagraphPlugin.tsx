import { Text, Element } from 'slate';
import { createParagraphPlugin as createDefaultParagraphPlugin } from '@udecode/plate-paragraph';
import { BLOCKS, INLINES, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { RichTextPlugin } from '../../types';
import { Paragraph } from './Paragraph';
import { transformUnwrap, transformWrapIn } from '../../helpers/transformers';
import { getParent } from '@udecode/plate-core';

function isEmbed(element: HTMLElement) {
  return (
    element.hasAttribute('data-embedded-entity-inline-id') ||
    element.hasAttribute('data-entity-type')
  );
}

function isEmpty(element: HTMLElement) {
  return element.textContent === '';
}

const INLINE_TYPES = Object.values(INLINES);

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
        validChildren: (_, [node]) => {
          // either text or inline elements
          return (
            Text.isText(node) ||
            (Element.isElement(node) && INLINE_TYPES.includes(node.type as INLINES))
          );
        },
        transform: transformUnwrap,
      },
      {
        // Wrap invalid text nodes in a paragraph
        match: Text.isText,
        validNode: (editor, [, path]) => {
          const parent = getParent(editor, path)?.[0];

          return !!(
            parent &&
            (TEXT_CONTAINERS.includes(parent.type) || INLINE_TYPES.includes(parent.type))
          );
        },
        transform: transformWrapIn(BLOCKS.PARAGRAPH),
      },
    ],
  };

  return createDefaultParagraphPlugin(config);
};
