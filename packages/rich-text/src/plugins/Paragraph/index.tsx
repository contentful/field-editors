import * as React from 'react';
import { css } from 'emotion';
import { ELEMENT_PARAGRAPH } from '@udecode/slate-plugins-paragraph';
import { BLOCKS } from '@contentful/rich-text-types';
import tokens from '@contentful/forma-36-tokens';
import { RenderElementProps } from 'slate-react';
import { SlatePlugin, getRenderElement } from '@udecode/slate-plugins-core';
import { getToggleElementOnKeyDown } from '@udecode/slate-plugins-common';
import { CustomSlatePluginOptions } from '../../types';

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

export function createParagraphPlugin(): SlatePlugin {
  const elementKeys: string[] = [ELEMENT_PARAGRAPH, BLOCKS.PARAGRAPH];

  return {
    renderElement: getRenderElement(elementKeys),
    pluginKeys: elementKeys,
    onKeyDown: getToggleElementOnKeyDown(BLOCKS.PARAGRAPH),
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
