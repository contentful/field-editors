import * as React from 'react';
import { css } from 'emotion';
import { PlatePlugin, PlateEditor } from '@udecode/plate-core';
import {
  createParagraphPlugin as createDefaultParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-paragraph';
import { BLOCKS } from '@contentful/rich-text-types';
import tokens from '@contentful/f36-tokens';
import { Element, Node, Transforms } from 'slate';
import { RenderElementProps } from 'slate-react';
import { CustomElement } from '../../types';

const styles = {
  [BLOCKS.PARAGRAPH]: css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
  `,
};

export function Paragraph(props: RenderElementProps) {
  return (
    <div {...props.attributes} className={styles[BLOCKS.PARAGRAPH]}>
      {props.children}
    </div>
  );
}

function isEmbed(element: HTMLElement) {
  return (
    element.hasAttribute('data-embedded-entity-inline-id') ||
    element.hasAttribute('data-entity-type')
  );
}

function isEmpty(element: HTMLElement) {
  return element.textContent === '';
}

export const createParagraphPlugin = (): PlatePlugin =>
  createDefaultParagraphPlugin({
    key: BLOCKS.PARAGRAPH,
    component: Paragraph,
    options: {
      hotkey: ['mod+opt+0'],
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'P',
        },
        {
          validNodeName: 'DIV',
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
    overrideByKey: {
      [ELEMENT_PARAGRAPH]: {
        // We convert the default slate plugin `p` to Contentful `BLOCKS.PARAGRAPH`
        type: BLOCKS.PARAGRAPH,
      },
      [BLOCKS.PARAGRAPH]: {
        type: BLOCKS.PARAGRAPH,
      },
    },
  });
