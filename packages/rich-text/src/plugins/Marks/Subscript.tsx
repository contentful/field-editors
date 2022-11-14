import * as React from 'react';

import { SubscriptIcon } from '@contentful/f36-icons';
import { createSubscriptPlugin as createDefaultSubscriptPlugin } from '@udecode/plate-basic-marks';
import { MARKS } from '@contentful/rich-text-types';
import * as Slate from 'slate-react';
import { someHtmlElement } from '@udecode/plate-core';

import { RichTextPlugin } from '../../types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

export const ToolbarSubscriptButton = createMarkToolbarButton({
  title: 'Subscript',
  // TODO: use correct import when it merged
  mark: 'subscript',
  icon: <SubscriptIcon viewBox="0 0 23 18" />,
});

export function Subscript(props: Slate.RenderLeafProps) {
  return <sub {...props.attributes}>{props.children}</sub>;
}

export const createSubscriptPlugin = (): RichTextPlugin =>
  createDefaultSubscriptPlugin({
    type: MARKS.SUBSCRIPT,
    component: Subscript,
    handlers: {
      onKeyDown: buildMarkEventHandler(MARKS.SUBSCRIPT),
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['SUB'],
        },
      ],
      query: (el) => {
        return !someHtmlElement(el, (node) => node.style.fontWeight === 'normal');
      },
    },
  });
