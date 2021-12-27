import { PlateEditor } from '@udecode/plate-core';
import { createParagraphPlugin as createDefaultParagraphPlugin } from '@udecode/plate-paragraph';
import { BLOCKS } from '@contentful/rich-text-types';
import { Element, Node, Transforms } from 'slate';
import { RichTextPlugin, CustomElement } from '../../types';
import { Paragraph } from './Paragraph';

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
    withOverrides: (editor: PlateEditor) => {
      const { normalizeNode } = editor;

      editor.normalizeNode = (entry) => {
        const [node, path] = entry;

        // If the element is a paragraph, ensure its children are valid.
        if (Element.isElement(node) && (node as CustomElement).type === BLOCKS.PARAGRAPH) {
          for (const [child, childPath] of Node.children(editor, path)) {
            if (Element.isElement(child) && !editor.isInline(child)) {
              Transforms.unwrapNodes(editor, {
                at: childPath,
              });
              return;
            }
          }
        }
        // Fall back to the original `normalizeNode` to enforce other constraints.
        normalizeNode(entry);
      };

      return editor;
    },
  };

  return createDefaultParagraphPlugin(config);
};
