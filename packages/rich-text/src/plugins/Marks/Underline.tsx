import * as React from 'react';

import { FormatUnderlinedIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { createUnderlinePlugin as createDefaultUnderlinePlugin } from '@udecode/plate-basic-marks';

import { someHtmlElement } from '../../internal/queries';
import { PlatePlugin, RenderLeafProps } from '../../internal/types';
import { createMarkToolbarButton } from './components/MarkToolbarButton';
import { buildMarkEventHandler } from './helpers';

export const ToolbarUnderlineButton = createMarkToolbarButton({
  title: 'Underline',
  mark: MARKS.UNDERLINE,
  icon: <FormatUnderlinedIcon />,
});

export function Underline(props: RenderLeafProps) {
  return <u {...props.attributes}>{props.children}</u>;
}

export const createUnderlinePlugin = (): PlatePlugin =>
  createDefaultUnderlinePlugin({
    type: MARKS.UNDERLINE,
    component: Underline,
    options: {
      hotkey: ['mod+u'],
    },
    handlers: {
      onKeyDown: buildMarkEventHandler(MARKS.UNDERLINE),
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: ['U'],
        },
        {
          validStyle: {
            textDecoration: ['underline'],
          },
        },
      ],
      query: (el) => {
        return !someHtmlElement(el, (node) => node.style.textDecoration === 'none');
      },
    },
  });
