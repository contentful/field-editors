import * as React from 'react';
import { css } from 'emotion';
import {
  PlatePlugin,
  getRenderElement,
  PlateEditor,
  ELEMENT_PARAGRAPH,
  getToggleElementOnKeyDown,
} from '@udecode/plate';
import { BLOCKS } from '@contentful/rich-text-types';
import tokens from '@contentful/f36-tokens';
import { Element, Node, Transforms } from 'slate';
import { RenderElementProps } from 'slate-react';
import { CustomSlatePluginOptions, CustomElement } from '../../types';
import { deserializeElement } from '../../helpers/deserializer';

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

export function createParagraphPlugin(): PlatePlugin {
  const elementKeys: string[] = [ELEMENT_PARAGRAPH, BLOCKS.PARAGRAPH];

  const deserializer = deserializeElement(BLOCKS.PARAGRAPH, [
    {
      nodeNames: ['P', 'DIV'],
    },
  ]);

  return {
    renderElement: getRenderElement(elementKeys),
    pluginKeys: elementKeys,
    onKeyDown: getToggleElementOnKeyDown(BLOCKS.PARAGRAPH),
    deserialize: (editor: PlateEditor) => {
      const { element, ...rest } = deserializer(editor);
      return {
        ...rest,
        element: element?.map((deserializeNode) => ({
          ...deserializeNode,
          deserialize: (el: HTMLElement) => {
            if (isEmpty(el) || isEmbed(el)) {
              return;
            }
            return deserializeNode.deserialize(el);
          },
        })),
      };
    },
    withOverrides: (editor) => {
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
}

export const withParagraphOptions: CustomSlatePluginOptions = {
  [ELEMENT_PARAGRAPH]: {
    // We convert the default slate plugin `p` to Contentful `BLOCKS.PARAGRAPH`
    type: BLOCKS.PARAGRAPH,
    component: Paragraph,
  },
  [BLOCKS.PARAGRAPH]: {
    type: BLOCKS.PARAGRAPH,
    component: Paragraph,
    hotkey: ['mod+opt+0'],
  },
};
