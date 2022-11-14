import * as React from 'react';

import { SuperscriptIcon } from '@contentful/f36-icons';
import { createSuperscriptPlugin as createDefaultSuperscriptPlugin } from '@udecode/plate-basic-marks';
import { MARKS } from '@contentful/rich-text-types';
import * as Slate from 'slate-react';
import { someHtmlElement } from '@udecode/plate-core';

import { RichTextPlugin } from '../../types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

export const ToolbarSuperscriptButton = createMarkToolbarButton({
  title: 'Superscript',
  mark:  MARKS.SUPERSCRIPT',
  icon: <SuperscriptIcon />,
});

export function Superscript(props: Slate.RenderLeafProps) {
  return <sup {...props.attributes}>{props.children}</sup>;
}

export const createSuperscriptPlugin = (): RichTextPlugin =>
  createDefaultSuperscriptPlugin({
    type: MARKS.SUPERSCRIPT,
    component: Superscript,
    handlers: {
      onKeyDown: buildMarkEventHandler(MARKS.SUPERSCRIPT),
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['SUP'],
        },
      ],
      query: (el) => {
        return !someHtmlElement(el, (node) => node.style.fontWeight === 'normal');
      },
    },
  });
