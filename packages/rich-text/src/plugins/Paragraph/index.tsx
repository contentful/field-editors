import * as React from 'react';
import { css } from 'emotion';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { BLOCKS } from '@contentful/rich-text-types';
import tokens from '@contentful/f36-tokens';
import { RenderElementProps } from 'slate-react';
import { PlatePlugin, getRenderElement, SPEditor } from '@udecode/plate-core';
import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { CustomSlatePluginOptions } from '../../types';
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
    deserialize: (editor: SPEditor) => {
      const { element, ...rest } = deserializer(editor);
      return {
        ...rest,
        element: element?.map((deserializeNode) => ({
          ...deserializeNode,
          deserialize: (el: HTMLElement) => {
            if (el.nodeName === 'DIV' && el.hasAttribute('data-entity-type')) {
              return;
            }
            return deserializeNode.deserialize(el);
          },
        })),
      };
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
